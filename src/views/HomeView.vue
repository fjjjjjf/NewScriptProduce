<template>
  <div class="w-full">
    <div class="grid grid-cols-5">
      <div class="col-span-3 ">
        <div >
          <span class="text-8xl font-bold " ref="typing"></span>
        </div>
        <div class="">
          <p class="italic  font-bold text-cyan-400">
            本次的项目目标旨在开发一个基于Vue框架和使用Node.js的交互式的游戏剧情生成系统，利用OpenAI平台的语言模型接口实现游戏剧情的自动生成。
            通过用户与AI模型的交互，根据用户的选择和输入，生成多样的游戏剧情，实现个性化的游戏体验。
          </p>
        </div>
      </div>
      <div class="col-span-2">
        <el-button type="warning" :plain="isAPIKeyInputed" round @click="addKey">

          {{ APIKeyInputBtnText }}
        </el-button>
        <el-button type="primary" round :plain="isModelSelected" @click="selectModelDialogVisiable = true">
          {{ modelSelectBtnText }} </el-button>
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
          <el-button type="primary" @click="addKeyDialogVisiable = false" style="margin-right:10px ;">
            确定
          </el-button>
        </div>

      </div>
    </el-dialog>
    <el-dialog v-model="selectModelDialogVisiable" :show-close="false" width="40%" title="🤖 选择您想使用的模型" center>
      <div class="px-4">
        <div>
          <div class="flex flex-row items-center justify-center">
            <ModelSelectCard v-for="model in models" v-bind:key="model.id" class="w-1/2 m-2"
              :model-image="model.modelImage" :model-name="model.modelName" :model-value="model.modelValue"
              :model-description="model.modelDescription" :is-selected="model.isSelected" />
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

const addKeyDialogVisiable = ref(false);
const selectModelDialogVisiable = ref(false);
const addKeyInputError = ref(false);

const openAIkey = ref("");
const selectedModel = ref("");

const typing = ref(null);

// 按钮样式控制
const isAPIKeyInputed = ref(false);
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
    modelImage: "/gpt3.5.svg",
    modelName: "GPT-3.5",
    modelValue: "0",
    modelDescription: "快速，准确度令人满意",
    isSelected: false,
  },
  {
    id: "1",
    modelImage: "/gpt4.svg",
    modelName: "GPT-4",
    modelValue: "1",
    modelDescription: "超乎想象的准确，但缓慢",
    isSelected: false,
  },
];

onMounted(() => {
  new Typed(typing.value, {
    strings: ["GameScript Produce"],
    typeSpeed: 60,
    backSpeed: 40,
    startDelay: 500,
    backDelay: 1500,
    loop: true,
  });
});

</script>
  
<style scoped></style>