<template>
    <div class="w-full ">
        <div>

            <div class=" h-screen grid grid-cols-10 ">
                <div class="bg-slate-300 rounded-full col-span-1 mx-5 my-5 w-12 h-12 cursor-pointer">
                    <el-icon size="50px" @click="gotoLookScript">
                        <Back />
                    </el-icon>

                </div>

                <el-form class="mb-10 pr-10 col-span-9 ">
                    <div style="height: 120px; margin-bottom: 3%;">
                        <el-alert center show-icon type="success">
                            <p class="text-2xl">在新建剧本的页面中，你可以选择地点，时间以及事件类型，然后让我们通过使用OpenAI进行自动生成相关的剧本，如果你对生成的剧本不满意，可以重新生成。
                            </p>
                        </el-alert>
                        <el-alert center show-icon type="warning">
                            <p class="text-2xl">若是关键词中没有你想要的，你也可以自己新建，但是我们会进行验证是否符合，比如你新建一个叫读书的地点，这当然是不行的！！</p>
                        </el-alert>
                    </div>
                    <div class="grid grid-rows-9  bg-slate-200   rounded-lg" style="background-color: #1e293b; z-index: 0;">
                        <div class="row-span-3 grid grid-cols-3">
                            <div class="col-span-1 px-3 pt-5 flex flex-row-reverse "><el-image
                                    style="height: 200px; width: 200px;" src="src\Image\left.jpg"> </el-image> </div>
                            <div class="col-span-1 pl-10">
                                <div class="row-span-1 pt-5  flex justify-self-center ">
                                    <el-text style="padding-right: 20px; " type="primary" tag="b" size="large"> 时间</el-text>
                                    <el-form-item size="large" class="pt-6">
                                        <el-select placeholder="选择你的时间" v-model="selectedTime">
                                            <el-option v-for="smalltime in Times" :value=smalltime.timename
                                                @click="updatetime(smalltime.timename)" />

                                            <el-button class="w-full" type="success" plain
                                                @click="isCreateNewWord = true, newtypeword = '时间'"> 新建</el-button>
                                        </el-select>
                                    </el-form-item>
                                </div>

                                <div class="row-span-1 pt-5 flex  justify-self-center">
                                    <el-text style="padding-right: 20px; " type="primary" tag="b" size="large">
                                        地点</el-text>

                                    <el-form-item size="large" class="pt-6">
                                        <el-select placeholder="选择你的地点" v-model="selectedPlace">
                                            <el-option v-for="smallplace in Places" :value=smallplace.placename
                                                @click="updateplace(smallplace.placename)" />

                                            <el-button class="w-full" type="success" plain
                                                @click="isCreateNewWord = true, newtypeword = '地点'"> 新建</el-button>
                                        </el-select>
                                    </el-form-item>

                                </div>


                                <div class="row-span-1 pt-5 flex justify-self-center">
                                    <el-text style="padding-right: 20px; " type="primary" tag="b" size="large">
                                        类型</el-text>

                                    <el-form-item size="large" class="pt-6">
                                        <el-select placeholder="选择你想要的事件类型" v-model="selectedType">
                                            <el-option v-for="smalltype in Types" :value=smalltype.typename
                                                @click="updatetype(smalltype.typename)" />

                                            <el-button class="w-full" type="success" plain
                                                @click="isCreateNewWord = true, newtypeword = '事件'"> 新建</el-button>
                                        </el-select>
                                    </el-form-item>
                                    <!-- <el-form-item>
                                        <el-button @click="dialogVisible = true">结束生成</el-button> 
                                    </el-form-item> -->
                                </div>



                            </div>
                            <div class="col-span-1 px-3 pt-5"><el-image style="height: 200px; width: 200px;"
                                    src="src\Image\right.jpg"> </el-image> </div>
                        </div>

                        <div class="row-span-6  justify-self-center h-4/6 w-3/4  px-1 ">
                            <div class="h-full">
                                <el-input v-if="!isloading" v-model="textarea" disabled
                                    :autosize="{ minRows: 8, maxRows: 20 }" class="text-2xl" type="textarea" />

                                
                                <el-skeleton v-else :rows="5" :animated="true" />
                                <div class="flex flex-row-reverse pt-5">
                                    <el-button type="primary" :disabled="isloading"
                                        @click="createScript(selectedTime, selectedType, selectedPlace, apikey, model)">生成</el-button>

                                </div>

                            </div>

                        </div>

                    </div>
                </el-form>
            </div>

            <el-dialog v-model="isCreateNewWord" title="Tips" width="30%">
                <div>
                    <div>
                        <el-text type="primary	">关键词的类型是{{ newtypeword }}</el-text>
                        <el-text type="primary	">请输入你想要添加的关键词</el-text>
                    </div>
                    <el-input v-model="input" placeholder="Please input" />
                    <div>
                        <div>
                            <el-button @click="isCreateNewWord = false">取消</el-button>
                            <el-button @click="checkNewword(newtypeword, input, apikey)">确定</el-button>
                        </div>
                    </div>
                </div>
            </el-dialog>

        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'


import { db, clearData } from "@/db"
import { Back } from "@element-plus/icons-vue";

import { useRouter } from "vue-router";
import { checkword, createNewScript } from "@/api/UseApi"
import { ElMessage } from 'element-plus';


const router = useRouter()
const gotoLookScript = () => {
    router.push('/lookgame')
}


interface Place {

    placename: string;
}
interface Time {

    timename: string;
}
interface Type {

    typename: string;
}

const Places = ref<Place[]>([]);
const Times = ref<Time[]>([]);
const Types = ref<Type[]>([]);
const selectedTime = ref('')
const selectedPlace = ref('')
const selectedType = ref('')


const apikey = ref('')
const model = ref('')
//添加关键词
const isCreateNewWord = ref(false);
const newtypeword = ref('');
const input = ref('')

const isloading = ref(false)

//新建剧本
const textarea = ref('')

const newtitle = ref('')

function updatetime(time: string) {
    selectedTime.value = time;
}
function updateplace(place: string) {
    selectedPlace.value = place;
}
function updatetype(type: string) {
    selectedType.value = type;
}



async function createScript(type1: string, type2: string, type3: string, apikey: string, model: string) {
    isloading.value = true;
    // if(type1==''||type2==''||type3=='') {
    //     ElMessage({
    //         message: "请进行选择！！",
    //         type: "error",
    //     });
    // }
    // else{
    textarea.value = await createNewScript(type1, type2, type3, apikey, model);
    // }
    if (textarea.value != '') {
        ElMessage({
            message: "已经添加新的剧本了，您可以返回查看现有所有剧本",
            type: "success",
        });
    }

    isloading.value = false;
}


async function checkNewword(type: string, input: string, apikey: string) {
    if (await checkword(type, input, apikey)) {
        if (type == "时间") {
            const newTime: Time = { timename: input };
            Times.value.push(newTime)
        } else if (type == "地点") {
            const newPlace: Place = { placename: input };
            Places.value.push(newPlace)
        }
        else {
            const newType: Type = { typename: input };
            Types.value.push(newType)
        }
        isCreateNewWord.value = false;

    }
}

onMounted(async () => {
    await db.open();
    const gameTimes = await db.time.toArray();
    Times.value = gameTimes.map((gameTimes) => ({

        timename: gameTimes.timename || '',

    }));
    const gamePlaces = await db.place.toArray();
    Places.value = gamePlaces.map((gamePlaces) => ({

        placename: gamePlaces.placename || '',

    }));

    const gameTypes = await db.type.toArray();
    Types.value = gameTypes.map((gameTypes) => ({

        typename: gameTypes.typename || '',
    }));

    const apikeymessage = await db.Apikey.toCollection().first();
    if (apikeymessage) {
        apikey.value = apikeymessage.apikey
        model.value = apikeymessage.model
    }

})
</script>