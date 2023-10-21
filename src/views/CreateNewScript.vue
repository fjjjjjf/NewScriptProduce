<template>
    <div class="w-full">
        <div class="grid grid-cols-5">
            <div class="col-span-1 my-3 w-full">
                <el-button class=" w-full my-3 " type="primary" @click="gotoLookScript">
                    查看剧本
                </el-button>
            </div>
            <div class="bg-green-200 col-span-4 mx-2 ">
                <el-form class="pt-2 px-10 ">
                    <div>
                        <el-alert center show-icon type="success">
                            <p class="text-2xl">在新建剧本的页面中，你可以选择地点，时间以及事件类型，然后让我们通过使用OpenAI进行自动生成相关的剧本，如果你对生成的剧本不满意，可以重新生成。
                            </p>
                        </el-alert>
                        <el-alert center show-icon type="warning">
                            <p class="text-3xl">若是关键词中没有你想要的，你也可以自己新建，但是我们会进行验证是否符合，比如你新建一个叫读书的地点，这当然是不行的！！</p>
                        </el-alert>
                    </div>
                    <div class="grid grid-cols-5">

                        <div class="py-3 col-span-2 w-full">
                            <el-form-item label="时间 " size="large">
                                <el-select placeholder="选择你的时间" v-model="selectedTime">
                                    <el-option v-for="smalltime in Times" :value=smalltime.timename
                                        @click="updatetime(smalltime.timename)" />

                                    <el-button class="w-full" type="success" plain> 新建</el-button>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="地点  " size="large">
                                <el-select placeholder="选择你的地点" v-model="selectedPlace">
                                    <el-option v-for="smallplace in Places" :value=smallplace.placename
                                        @click="updateplace(smallplace.placename)" />

                                    <el-button class="w-full" type="success" plain> 新建</el-button>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="类型" size="large">
                                <el-select placeholder="选择你想要的事件类型" v-model="selectedType">
                                    <el-option v-for="smalltype in Types" :value=smalltype.typename
                                        @click="updatetype(smalltype.typename)" />

                                    <el-button class="w-full" type="success" plain> 新建</el-button>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary">生成</el-button>
                                <el-button @click="dialogVisible=true">结束生成</el-button>
                            </el-form-item>
                        </div>
                        <div class="col-span-3 w-full px-1 py-2">
                            <el-input v-model="textarea" disabled :autosize="{ minRows: 8, maxRows: 20 }" type="textarea" />
                        </div>
                    </div>


                </el-form>
            </div>
            <el-dialog v-model="dialogVisible" title="Tips" width="30%">是否确定
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">Cancel</el-button>
                        <el-button type="primary" @click="SendMessage(textarea)">
                            Confirm
                        </el-button>
                    </span>
                </template>
            </el-dialog>
           
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'


import { db, clearData } from "@/db"

import { useRouter } from "vue-router";



const router = useRouter()
const gotoLookScript = () => {
    router.push('/game')
}

interface Place {
    id: number;
    placename: string;
}
interface Time {
    id: number;
    timename: string;
}
interface Type {
    id: number;
    typename: string;
}

const Places = ref<Place[]>([]);
const Times = ref<Time[]>([]);
const Types = ref<Type[]>([]);
const selectedTime = ref('')
const selectedPlace = ref('')
const selectedType = ref('')
const dialogVisible = ref(false);

const textarea = ref('12')

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

function SendMessage(text: string) {
    if (text != '' && selectedTime.value!=''&& selectedPlace.value!=''&& selectedType.value!='') {
        db.open().then(() => {
            // 添加初始数据
            db.gamescript.bulkAdd([
                { title: newtitle.value, description: text, placename: selectedPlace.value, timename: selectedTime.value, typename: selectedType.value },
            ]).then(() => {
                console.log('Database initialized with initial data.',text);
                dialogVisible.value=false
            }).catch(err => {
                console.error('Error adding initial data: ', err);
            });
        }).catch(err => {
            console.error('Error opening database: ', err);
        });

    }
    else{
        alert('有其他数据没有选择或者没有生成数据，请重新生成！！')
    }
}

onMounted(async () => {
    await db.open();
    const gameTimes = await db.time.toArray();
    Times.value = gameTimes.map((gameTimes) => ({
        id: gameTimes.id || 0,
        timename: gameTimes.timename || '',

    }));
    const gamePlaces = await db.place.toArray();
    Places.value = gamePlaces.map((gamePlaces) => ({
        id: gamePlaces.id || 0,
        placename: gamePlaces.placename || '',

    }));

    const gameTypes = await db.type.toArray();
    Types.value = gameTypes.map((gameTypes) => ({
        id: gameTypes.id || 0,
        typename: gameTypes.typename || '',
    }));


})
</script>