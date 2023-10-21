<template>
  <div class="flex justify-center  items-center">
    <div class="grid grid-rows-2">
      <div class="row-span-2  ">
        <div class="h-36 flex justify-center  items-center">
          <span class=" text-white text-8xl font-bold " ref="typing"></span>
        </div>
        <div class="row-span-1 grid grid-cols-5 my-10 flex justify-center  items-center ">
          <div class="col-span-1"></div>
          <div class="col-span-1">
            <el-card class="mx-3 w-8/12 ">
              <template #header>

                <span class="flex justify-center text-3xl font-bold "><el-icon size="38">
                    <HomeFilled />
                  </el-icon> 目标</span>
              </template>
              <div>
                本次的项目目标旨在开发一个基于Vue框架和使用Node.js的交互式的游戏剧情生成系统，利用OpenAI平台的语言模型接口实现游戏剧情的自动生成。
                通过用户与AI模型的交互，根据用户的选择和输入，生成多样的游戏剧情，实现个性化的游戏体验。
              </div>
            </el-card>
          </div>
          <div class="col-span-1"> <el-card class="mx-3 w-8/12 ">
              <template #header>

                <span class="flex justify-center text-3xl font-bold "><el-icon size="38">
                    <View />
                  </el-icon>提示</span>
              </template>
              <div>
                首先你需要获得并输入你的ApiKey以及选择AI模型，之后才能进行下一步操作 (
                您可以在
                <a class="text-blue-500" href="https://platform.openai.com/account/api-keys">OpenAI Key Management</a>
                页面获取 OpenAI API Key.

                )
              </div>
            </el-card></div>
          <div class="col-span-1"> <el-card class="mx-3 w-8/12 ">
              <template #header>

                <span class="flex justify-center text-3xl font-bold "><el-icon size="38">
                    <Tools />
                  </el-icon>功能</span>
              </template>
              <div>
                本项目具有三个主要功能，分别是查看现有剧本；新建剧本；根据选项推进游戏剧情三大功能
              </div>
            </el-card></div>


          <div class="col-span-1 flex flex-col ">
            <el-button type="primary" class=" mb-2 mx-3" round @click="addKey">
              {{ APIKeyInputBtnText }}
            </el-button>
            <el-button type="success" class=" mb-2 mx-3" round @click="selectModelDialogVisiable = true">
              {{ modelSelectBtnText }} </el-button>
            <el-button type="warning" class="mb-2 mx-3" @click="$router.push('/lookgame')" round>
              下一步
            </el-button>
          </div>
        </div>
      </div>

    </div>
    <el-dialog v-model="addKeyDialogVisiable" width="50%" title="🔑 输入你的 OpenAI API Key">
      <div class="p-0">
        <div id="add-key-hint" class="my-1">
          <div>
            您可以在
            <a class="text-blue-500" href="https://platform.openai.com/account/api-keys">OpenAI Key Management</a>
            页面获取 OpenAI API Key.
          </div>
          <div class="my-1">
            您的 Key 将会被保存在本地浏览器中，我们不会收集您的 Key.
          </div>
        </div>
        <div id="add-key-input" class="my-6">
          <el-input v-model="openAIkey" placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          <div class="mt-4 text-red-500" v-if="addKeyInputError">
            您输入的 Key 格式有误。OpenAI API Key 应为 "sk-" 打头，长度为 51
            一个字符的串。
          </div>
        </div>
        <div class="flex flex-row ">
          <el-button @click="addKeyDialogVisiable = false">取消</el-button>
          <el-button type="primary" @click="check(openAIkey)" style="margin-right:10px ;">
            确定
          </el-button>
        </div>

      </div>
    </el-dialog>
    <el-dialog v-model="selectModelDialogVisiable" :show-close="false" width="40%" title="🤖 选择您想使用的模型" center>
      <div class="px-4">
        <div>
          <div class="flex flex-row items-center justify-center">
            <ModelSelectCard v-for="model in models"
              @submit-model="(modelValue: string) => check2(modelValue, UserApiKey)" v-bind:key="model.id"
              class="w-1/2 m-2" :model-image="model.modelImage" :model-name="model.modelName"
              :model-value="model.modelValue" :model-description="model.modelDescription"
              :is-selected="model.isSelected" />
          </div>
        </div>
      </div>
    </el-dialog>



  </div>
</template>
  
<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import Typed from "typed.js";
import ModelSelectCard from "@/components/ModelSelectCard.vue";
import { checkApiKey, checkmodel } from "@/api/UseApi"
import { db } from "@/db";
import { ElMessage } from "element-plus";
import { Tools, HomeFilled, View } from "@element-plus/icons-vue";



const addKeyDialogVisiable = ref(false);
const selectModelDialogVisiable = ref(false);
const addKeyInputError = ref(false);

const openAIkey = ref("");


const UserApiKey = ref('')


const typing = ref(null);


const check = async (openAIkey: string) => {
  if (openAIkey.slice(0, 3) != "sk-" || openAIkey.length !== 51) {
    addKeyInputError.value = true;
    return;
  }
  else {
    if (await checkApiKey(openAIkey)) {
      console.log("333")
      UserApiKey.value = openAIkey
      addKeyDialogVisiable.value = !addKeyDialogVisiable.value;
      console.log(UserApiKey.value);
    }

  }
}

const check2 = async (modelid: string, apikey: string) => {
  if (apikey == '') {
    ElMessage({
      message: "请先输入apiKey，才能验证是否能使用该模型",
      type: "error",
    });
  }
  else {
    if (await checkmodel(modelid, apikey)) {
      selectModelDialogVisiable.value = !selectModelDialogVisiable.value
    }
  }
}

// 按钮样式控制

const APIKeyInputBtnText = ref("输入 API Key");
const isModelSelected = ref(false);
const modelSelectBtnText = ref("选择模型");

// 控制弹窗样式
const inputKeyWindowLoading = ref(false);


function addKey() {
  addKeyDialogVisiable.value = !addKeyDialogVisiable.value;
  console.log(addKeyDialogVisiable.value);
  console.log("open addKeyDialog");
}

const models = [
  {
    id: "0",
    modelImage: "src/Image/gpt3.5.svg",
    modelName: "GPT-3.5",
    modelValue: "0",
    modelDescription: "快速，准确度令人满意",
    isSelected: false,
  },
  {
    id: "1",
    modelImage: "src/Image/gpt4.svg",
    modelName: "GPT-4",
    modelValue: "1",
    modelDescription: "超乎想象的准确，但缓慢",
    isSelected: false,
  },
];

onMounted(async () => {
  new Typed(typing.value, {
    strings: ["GameScript Produce"],
    typeSpeed: 60,
    backSpeed: 40,
    startDelay: 500,
    backDelay: 1500,
    loop: true,
  });
  await db.open();
  const firtRecord = await db.Apikey.toCollection().first();
  if (firtRecord) {
    UserApiKey.value = firtRecord.apikey;
  }
});

</script>
  
<style scoped></style>