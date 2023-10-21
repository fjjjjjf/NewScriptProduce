<template>
  <div class="notebook">
    <div class="left-pane">
      <h2 class="dark:text-black pt-4">{{ title }}</h2>
      <p v-if="currentStoryIndex == 0" class="dark:text-black">{{ description }}</p>
      <p v-else class="dark:text-black">{{ game[currentStoryIndex].des }}</p>
      <button class="dark:text-black"
        @click="() => { if (currentStoryIndex >= 1) { currentStoryIndex--; last = true } }">上一页</button>
    </div>
    <div class="right-pane">

      <div v-if="currentStoryIndex == 0 || last == true" class="content">
        <button @click="nextPage(MaxcurrentStoryIndex - currentStoryIndex, '下一页')"> 下一页
        </button>
      </div>
      <div v-else class="content1">
        <div v-for="choice in game[currentStoryIndex].choices ">
          <button v-if="choice != null" :disabled="choice == '游戏结束了！' || last"
            @click="nextPage(MaxcurrentStoryIndex - currentStoryIndex, choice)">{{ choice }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">


import { ElMessage } from "element-plus";
import { ref, defineProps, onMounted } from "vue";
import { createStory } from "@/api/UseApi"
import { db } from "@/db";

const currentStoryIndex = ref(0);
const MaxcurrentStoryIndex = ref(0);
const ApiKey = ref("");
const ModelId = ref("");
const last = ref(false)

const background1 = ref(' 我想让你和我玩文字冒险游戏，这个游戏的背景是，')
const background2 = ref('请注意构造的情节要丰富且符合现实逻辑。请你只以json的形式返回当前的故事进展（意味着这个json里面只有一个story字段，一个choice字段和一个round字段），这个json包含三个字段。类似这样的结构{"story": "string","choice": [{A:"string"},{B:"string"},{C:"string"},{D:"string"},],"round": 10}其中story字段是故事发展的叙述。另一个字段choice是一个数组，包含四个不同的选项编号分别为ABCD（如果游戏结束则choice内部的只有null一个值），每次回复请给我四个选项，这些选项中存在着错误的陷阱选项，选择这些选项可能会导致游戏直接走向坏结局（即游戏结束），每个不同的选项将以不同的方式推动剧情的进展。最后一个字段是round，它代表剩余的回合数，初始时round=10，用户每进行一次选择都会减1，每次生成回答的时候要根据当前的还剩余的round来有序的推动剧情发展，切记当round=0时，将触发结局的剧情，切记请根据用户之前的选择生成一个合理的结局剧情放在story字段（结局剧情提示： 主角会进行符合游戏背景的剧情进行选择，一定要在round=0这一回合结束所有剧情内容），游戏结束。后续我将输入选项的编号，代表我选择了这个选项，根据我的选择来生成下一步的json。')

const background3 = ref('返回的content内容格式是{"story": "string","choice": [{A:"string"},{B:"string"},{C:"string"},{D:"string"},],"round": number}')
interface GameComponent {
  des: string,
  choices: string[],
}
const game = ref<GameComponent[]>([])
const { title, description } = defineProps<{
  title: string;
  description: string;
}>();
game.value = [
  {
    des: description as string,
    choices: ['下一页', '下一页', '下一页', '下一页'],
  },

]
interface StoryData {
  story: string;
  choice: {
    A: string;
    B: string;
    C: string;
    D: string;
  }[];
}
const Story: string[] = [];
const nextPage = async (number1: number, choice: string) => {
  console.log(number1)
  if (number1 > 1) {
    currentStoryIndex.value++;
  }
  else if (number1 == 1) { last.value = false; currentStoryIndex.value++; }
  else if (number1 == 0) {

    if (choice != '下一页') { Story.push(choice) }

    console.log(Story)

    console.log(game.value[currentStoryIndex.value].des)
    if (currentStoryIndex.value == 0) { Story.push(background1.value + description + background2.value) }
    else Story.push(
      background3.value
    )
    const data: StoryData = await createStory(Story.join('\n'), ApiKey.value, ModelId.value)
    console.log(data)
    if (data.story != '' && data.choice != null) {
      
      game.value.push({
        des: data.story as string,
        choices: [
          data.choice[0].A,
          data.choice[1].B,
          data.choice[2].C,
          data.choice[3].D,
        ]
      })
    }
    else {
      game.value.push({
        des: data.story as string,
        choices: [
          '游戏结束了！',
        ]
      })
    }
    console.log("11")
    MaxcurrentStoryIndex.value++;
    currentStoryIndex.value++;
    Story.push(data.story);
  }

  else {
    ElMessage({
      message: "已经到达最终页",
      type: 'warning',
    });
  }
  console.log(currentStoryIndex.value, MaxcurrentStoryIndex.value)
}



onMounted(async () => {
  await db.open();

  const apikeymessage = await db.Apikey.toCollection().first();
  if (apikeymessage) {
    ApiKey.value = apikeymessage.apikey
    ModelId.value = apikeymessage.model
  }

})

</script>
  
<style scoped>
.notebook {
  width: 100%;
  display: flex;
  height: 500px;
  flex-direction: row;
  justify-content: center;
  background-color: #f2e9d3;
  border: 10px solid #8b5b34;
  box-shadow: 5px 5px 5px #888888;
  margin: auto;
}

.left-pane {
  padding: 20px;
  text-align: justify;
  width: 50%;

  border-right: 10px solid #c59f7f;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.left-pane button {
  margin-top: auto;
}

.right-pane {
  width: 50%;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.right-pane .content {
  display: flex;
  flex-direction: column;
}

.right-pane .content1 {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.right-pane button {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h2,
p {
  margin: 0;
}

h2 {
  font-size: 36px;
  margin-bottom: 10px;
}

p {
  font-size: 20px;
  line-height: 1.5;
  margin-bottom: 30px;
}

button {
  display: block;
  margin-bottom: 10px;

  padding: 5px 10px;
  font-size: 20px;
  background-color: #f2e9d3;
  border: none;
  box-shadow: 2px 2px 2px #888888;
  cursor: pointer;
}

button:hover {
  background-color: #8b5b34;
  color: #f2e9d3;
}

.example-showcase .el-loading-mask {
  z-index: 9;
}
</style>