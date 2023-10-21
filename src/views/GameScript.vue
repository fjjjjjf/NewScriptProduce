<template>
    <div class="w-full">
        <div class="grid grid-cols-5">
            <div class="col-span-1 my-3 w-full">
                <el-button class=" w-full my-3 " type="primary">
                    查看剧本
                </el-button>
                <div></div>
                <el-button class=" w-full my-3 " type="primary" @click="gotoCreateNewScript">
                    新建剧本
                </el-button>
            </div >
            <div class="col-span-4  bg-blue outline-pink-500 border-2 mx-10 pb-5">
                <div class="flex flex-row ">
                    <div class="col-span-1"> <el-select v-model="place"> <el-option v-for="smallplace in Places"
                                :value="smallplace.placename"
                                @click="handleOption1Click(smallplace.placename)"></el-option></el-select></div>
                    <div class="col-span-1"><el-select v-model="time"><el-option v-for="smalltime in Times"
                                :value="smalltime.timename"
                                @click="handleOption2Click(smalltime.timename)"></el-option></el-select></div>
                    <div class="col-span-1"> <el-select v-model="type"><el-option v-for="smalltype in Types"
                                :value="smalltype.typename"
                                @click="handleOption3Click(smalltype.typename)"></el-option></el-select></div>
                  <el-button @click="getAllOption()">查找所有</el-button>
                </div>
                
                <div class="flex flex-col w-full col-span-4">
                    <div v-for="(script, index) in Scripts" :key="index" class=" ">
                        <ScriptCard :scriptId="script.id" :title="script.Title" :description="script.Description"
                            :place="script.Place" :time="script.Time" :type="script.type" class="mt-5 px-4 mx-4">
                        </ScriptCard>
                    </div>
                </div>
            </div>

            
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import type { Ref } from "vue";
import ScriptCard from '@/components/ScriptCard.vue';
import { db, clearData } from "@/db"
import { el } from 'element-plus/es/locale/index.mjs';
import { useRouter } from "vue-router";

const router = useRouter();
const gotoCreateNewScript = () => {
    router.push('/newScript')
}

interface Script {
    id: number;
    Title: string;
    Description: string;
    Place: string;
    Time: string;
    type: string;
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
const ALLScripts = ref<Script[]>([]);
const Scripts = ref<Script[]>([]);
const Places = ref<Place[]>([]);
const Times = ref<Time[]>([]);
const Types = ref<Type[]>([]);

const place = ref("地点")
const time = ref("时间")
const type = ref("事件类型")

watch([place, time, type], ([newVal1, newVal2, newVal3], [oldVal1, oldVal2, oldVal3]) => {

    if (newVal2 == '时间' && newVal3 == '事件类型') {
        Scripts.value = ALLScripts.value.filter(s => s.Place === newVal1)
    }
    else if (newVal1 == '地点' && newVal3 == '事件类型')
        Scripts.value = ALLScripts.value.filter(s => s.Time === newVal2)
    else if (newVal2 == '时间' && newVal1 == '地点')
        Scripts.value = ALLScripts.value.filter(s => s.type === newVal3)
    else if (newVal2 == '时间')
        Scripts.value = ALLScripts.value.filter(s => s.type === newVal3 && s.Place === newVal1)
    else if (newVal1 == '地点')
        Scripts.value = ALLScripts.value.filter(s => s.type === newVal3 && s.Time === newVal2)
    else if (newVal3 == '事件类型')
        Scripts.value = ALLScripts.value.filter(s => s.Time === newVal2 && s.Place === newVal1)
    else {
        Scripts.value = ALLScripts.value.filter(s => s.Time === newVal2 && s.Place === newVal1 && s.Place === newVal1)
    }
});





onMounted(async () => {
    await db.open();
    const gameScripts = await db.gamescript.toArray();
    Scripts.value = gameScripts.map((script) => ({
        id: script.id || 0,
        Title: script.title || '',
        Description: script.description || '',
        Place: script.placename || '',
        Time: script.timename || '',
        type: script.typename || '',
    }));
    ALLScripts.value = Scripts.value
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

const handleOption1Click = (value: any) => {
    console.log(value)
    place.value = value;
};
const handleOption2Click = (value: any) => {
    time.value = value;
};
const handleOption3Click = (value: any) => {
    type.value = value;
};

const getAllOption = () => {
    Scripts.value = ALLScripts.value;
}


</script>