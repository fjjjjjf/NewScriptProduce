<template>
  <div class=" grid cols-span-5" style="background-color: #1d1d1d;">
    <div class="bg-slate-300 col-span-1 rounded-full col-span-1 mt-2 ml-2 w-12 h-12 cursor-pointer">
      <el-icon size="50px" @click="gotoLookScript">
        <Back />
      </el-icon>


      <el-icon size="50px" class="bg-slate-300 rounded" @click="showMessage">
        <InfoFilled />
      </el-icon>


    </div>
    <div class="flex flex-col w-10/12 col-span-4  justify-self-center">
      <el-image style="height: 20%;" src="src\Image\prison.png" class="w-full mb-10 " />

      <!-- <Book :description="storyDescription" :title="storyTitle" class="my-2" /> -->
      <div class="notebook">
        <div class="left-pane">
          <h2 class="dark:text-black pt-4">{{ storyTitle }}</h2>
          <p v-if="currentStoryIndex == 0" class="text-neutral-950  font-bold ">{{ storyDescription }}</p>
          <p v-else class="text-neutral-950 text-1xl font-bold">{{ game[currentStoryIndex].des }}</p>
          <button class="dark:text-black" :disabled="isloading"
            @click="() => { if (currentStoryIndex >= 1) { currentStoryIndex--; last = true } }">上一页</button>
        </div>
        <div class="right-pane">
          <div v-if="!isloading">
            <div v-if="currentStoryIndex == 0 || last == true">
              <button @click="nextPage(MaxcurrentStoryIndex - currentStoryIndex, '下一页')"> 下一页
              </button>
            </div>
            <div v-else>
              <div v-for="choice in game[currentStoryIndex].choices   ">
                <button v-if="choice != null && choice != ''" :disabled=" last"
                  @click="nextPage(MaxcurrentStoryIndex - currentStoryIndex, choice)" class="font-bold text-base">{{
                    choice }}</button>
              </div>
            </div>
          </div>
          <div v-else><img style="background-color:#c59f7f;max-height: 400px;" src="src\Image\1.gif" /></div>
        </div>
      </div>
    </div>
    <el-dialog v-model="isOver" title="Tips" width="30%">
      <div>
        <div>
          <el-text type="primary	">游戏已经结束！！点击确定则返回上个界面</el-text>

        </div>

        <div>
          <div>
            <el-button @click="isOver = false">取消</el-button>
            <el-button @click="gotoLookScript">确定</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- <button @click="solve()"> 下一页
              </button> -->

  </div>
</template>
  
<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue";
import { Back, InfoFilled } from "@element-plus/icons-vue";
import Book from "@/components/Book.vue"
import { useRoute, useRouter } from "vue-router";
import { db } from "@/db";
import { ElMessage, ElMessageBox } from "element-plus";

import { createStory } from "@/api/UseApi"

const currentStoryIndex = ref(0);
const MaxcurrentStoryIndex = ref(0);
const ApiKey = ref("");
const ModelId = ref("");
const last = ref(false)

const background1 = ref(' 我想让你和我玩文字冒险游戏，这个游戏的背景是，')
const background2 = ref('请注意构造的情节要丰富且符合现实逻辑。请你只以json的形式返回当前的故事进展（意味着这个json里面只有一个story字段，一个choice字段），这个json包含两个字段。类似这样的结构{"story": "string","choice": ["string","string","string","string",]}其中story字段是故事发展的叙述。另一个字段choice是一个数组，包含四个不同的选项编号分别为ABCD（如果游戏结束则choice内部的只有null一个值），每次回复请给我四个选项，这些选项中存在着错误的陷阱选项，选择这些选项可能会导致游戏直接走向坏结局（即游戏结束），每个不同的选项将以不同的方式推动剧情的进展。后续我将输入选项的编号，代表我选择了这个选项，根据我的选择来生成下一步的json。当我发送最后一条用户信息时，会在最后时候告诉你回合数多少，当发送的回合数值为1时，强制结束游戏，只需要发送格式{story:string}，游戏结束。')

const background3 = ref('返回的content内容格式是{"story": "string","choice": ["string","string","string","string",]}，如果我发送的回合数为1时，只需要返回格式{story:string}')
interface GameComponent {
  des: string,
  choices: string[],
}

interface choicetype {
  A?: string,
  B?: string,
  C?: string,
  D?: string
}

const game = ref<GameComponent[]>([])
const route = useRoute();
const router = useRouter()
const gotoLookScript = () => {
  router.push('/lookgame')
}
const isloading = ref(false)
const isOver = ref(false)

onMounted(async () => {

  await db.open();

  const apikeymessage = await db.Apikey.toCollection().first();
  if (apikeymessage) {
    ApiKey.value = apikeymessage.apikey
    ModelId.value = apikeymessage.model
  }

  storyDescription.value = route.query.description as string
  storyTitle.value = route.query.title as string

  game.value = [
    {
      des: storyDescription.value as string,
      choices: ['下一页', '下一页', '下一页', '下一页'],
    },

  ]
})
interface StoryData {
  story: string;

  choice: string[];


}
const Story: string[] = [];
const nextPage = async (number1: number, choice: string) => {
 
  if (choice != '游戏结束了！'&&choice != '游戏结束'&&choice != '游戏结束了'&&"结束游戏") {
    if (number1 > 1) {
      currentStoryIndex.value++;
    }
    else if (number1 == 1) { last.value = false; currentStoryIndex.value++; }  //如果是翻到最后一页的时候，则可以翻下去
    else if (number1 == 0) {
      isloading.value = true;
      if (choice != '下一页') { Story.push(choice) }

     
      if (currentStoryIndex.value == 0) { Story.push(background1.value + storyDescription.value + background2.value) }
      else Story.push(
        background3.value
      )
      let data: StoryData = await createStory(Story.join('\n'), ApiKey.value, ModelId.value)
      
      isloading.value = false;
     
      const choiceArr: string[] = [];
      if (data.choice.length != 0) {
        for (let i = 0; i < data.choice.length; i++) {
          // if(i==0) {const content = data.choice.A}
          // const content = (data.choice[i] as unknown as Record<string, string>)[Object.keys(data.choice[i])[0]] || '';
          const content = data.choice[i]

          choiceArr.push(content)
        }
       
        if (choiceArr.length == 0) {

          // for (let i = 0; i < Object.keys(data.choice).length; i++) {
          //   data.choice as choicetype;
          //   const content = data.choice[Object.keys(data.choice)[0]]
          //   // const content =data.choice[i]

          //   choiceArr.push(content)
          // }

          for (let key of Object.keys(data.choice)) {

            const content = (data.choice)[key];

            choiceArr.push(content);
          }
        }
       
        if (data.story != '' && data.choice != null) {

          game.value.push({
            des: data.story as string,
            choices: choiceArr,
          })
        }
        else if (choiceArr.length==0||choiceArr==null||data.choice.every(choice => choice === null) ) {
         
          game.value.push({
            des: data.story as string,
            choices: [
              '游戏结束了！',
            ]
          })
        }
      } else {
        
        game.value.push({
          des: data.story as string,
          choices: [
            '游戏结束了！',
          ]
        })
      }



    
      MaxcurrentStoryIndex.value++;
      currentStoryIndex.value++;
      if (MaxcurrentStoryIndex.value > 1) { Story.pop(); }
      Story.push(data.story);
    }

    else {
      ElMessage({
        message: "已经到达最终页",
        type: 'warning',
      });
    }
  }
  else {
   
    isOver.value = true
  }


}

const showMessage = () => {
  ElMessageBox.alert('该功能主要是点击选项，根据AI生成的内容和选项，进行下一步的选择，当然AI的反应有时候也不是那么快的，请耐心等待！！', '内容提示', {
    // if you want to disable its autofocus
    // autofocus: false,
    confirmButtonText: 'OK',
    type:"warning",
  })
}
function solve() {
 // const choicesText:string[]=[]
  const data =  "你们决定离开图书馆，前往学校的实验室探索。实验室里弥漫着化学品的味道，各种仪器和实验器材摆放得井井有条。你们开始寻找线索，突然发现了一个锁着的实验室柜子。你们面临以下选择：\n\nA. 尝试破解柜子的密码。\nB. 继续寻找其他线索。\nC. 询问学校管理员关于柜子的信息。\nD. 放弃并离开实验室。\n\n（剩余回合数：12）"
 
  const  choicesText =data.split(/(\n)?\n(?=[ABCD]\.)/);
 console.log(choicesText.slice(1).filter(item => (item !== '\n')&&(item !== undefined)));
  


}


const storyTitle = ref("")


const storyDescription = ref("")

</script>
    
<style>
.notebook {
  width: 80%;
  display: flex;
  height: 500px;
  flex-direction: row;
  justify-content: center;
  background-color: #f2e9d3;
  border: 10px solid #8b5b34;
  box-shadow: 5px 5px 5px #888888;
  margin: 20px auto;

  margin-bottom: 1%;
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



h2 {
  font-size: 36px;
  margin-bottom: 10px;
}

/* p {
  font-size: 20px;
  line-height: 1.5;
} */

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