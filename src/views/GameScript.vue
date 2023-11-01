<template>
    <div class="w-full h-screen">
        <div class="grid grid-cols-5">
            <div class="col-span-1 my-3 w-full ">

                <el-button class=" w-full my-3 " type="primary">
                    查看剧本
                </el-button>
                <div></div>

                <el-button class=" w-full my-3 " type="primary" @click="gotoCreateNewScript">
                    新建剧本
                </el-button>
                <div></div>
                <el-button class=" w-full my-3 " @click="showHistoryScript" type="primary">
                    查看历史纪录
                </el-button>
                <div></div>
                <el-button class=" w-full my-3 " @click="deledata()" type="warning">
                    删除所有剧本
                </el-button>
            </div>

            <div class="w-full col-span-4 outline-pink-500 border-2 mx-10 pr-10  mt-5 rounded">
                <div class="flex flex-row w-full ">
                    <div class=" w-full"> <el-select class=" w-full " v-model="place"> <el-option
                                v-for="smallplace in Places" :value="smallplace.placename"
                                @click="handleOption1Click(smallplace.placename)"></el-option></el-select></div>
                    <div class=" w-full"><el-select class=" w-full " v-model="time"><el-option v-for="smalltime in Times"
                                :value="smalltime.timename"
                                @click="handleOption2Click(smalltime.timename)"></el-option></el-select></div>
                    <div class=" w-full"> <el-select class=" w-full " v-model="type"><el-option v-for="smalltype in Types"
                                :value="smalltype.typename"
                                @click="handleOption3Click(smalltype.typename)"></el-option></el-select></div>
                    <el-button class=" w-full" @click="getAllOption()">查找所有</el-button>
                </div>


                <el-dialog v-model="isOpen">
                    <div>
                        <div class="md-5 grid justify-self-end ">
                            <el-button @click="AllDelect"> 删除全部</el-button>
                        </div>
                        <div v-for="h in History ">
                            <el-card v-if="h!=''" class=" w-full mt-2">
                                <div class="flex flex-row px-8 w-full">
                                    <p class="text-2xl">{{ h }}</p>
                                </div>
                                <div class="flex justify-end">
                                    <el-button class="ml-4 " @click="GoToGame(h)"> 继续游戏
                                    </el-button>
                                    <el-button class="ml-4 " @click="deleteHistory(h)"> 删除</el-button>
                                </div>
                            </el-card>
                        </div>
                    </div>
                </el-dialog>
                <div class="flex flex-col w-full col-span-4">
                    <el-inner-scrollbar style="max-height: 800px; overflow-y: auto;">
                        <div v-for="(script, index) in Scripts" :key="index">
                            <ScriptCard :scriptId="script.id" :title="script.Title" :description="script.Description"
                                :place="script.Place" :time="script.Time" :type="script.type" class="mt-5 px-4 mx-4">
                            </ScriptCard>
                        </div>
                    </el-inner-scrollbar>
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
import { ElMessage, ElMessageBox } from 'element-plus'
const router = useRouter();
const gotoCreateNewScript = () => {
    router.push('/newScript')
}

const count = ref(0)
const load = () => {
    count.value += 2
}
const isOpen = ref(false);

const ALLScripts = ref<Script[]>([]);
const Scripts = ref<Script[]>([]);
const Places = ref<Place[]>([]);
const Times = ref<Time[]>([]);
const Types = ref<Type[]>([]);

const place = ref("地点")
const time = ref("时间")
const type = ref("事件类型")

const History= ref(['']);



const deledata = () => {

    ElMessageBox.confirm(
        '是否要删除全部剧本数据(数据将无法追回)',
        'Warning',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
            clearData();
            location.reload();

        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '删除取消',
            })
        })


}
const AllDelect = () => {
    ElMessageBox.confirm('是否全部删除?', '内容提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true,
    }).then(async () => {
        await db.open();
        await db.historyScript.clear().then(() => {
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
        })
        db.close();
        History.value = [];
    }).catch(() => {

        ElMessage({
            type: 'info',
            message: '删除失败',
        })
    })
}
const GoToGame = (h: string) => {
    router.push({
        path: '/game',
        query: { description: '', title: h }
    })
}
const deleteHistory = (h: string) => {
    ElMessageBox.confirm('是否删除该历史记录?', '内容提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true,
    }).then(async () => {
        await db.open().then(() => {
            // 使用 where().equals().delete() 查询并删除匹配的数据
            return db.historyScript.where('title').equals(h).delete();
        }).then(deleteCount => {
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
            History.value = History.value.filter(item=>item!=h);
            console.log(2)
        }).catch(error => {
            ElMessage({
                type: 'info',
                message: '删除失败',
            })
        }).finally(() => {
            // 关闭数据库连接
            db.close();
        });

    }).catch(() => {

        ElMessage({
            type: 'info',
            message: '删除失败',
        })
    })
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

watch([place, time, type], ([newVal1, newVal2, newVal3], [oldVal1, oldVal2, oldVal3]) => {

    if (newVal2 == '时间' && newVal3 == '事件类型' && newVal1 == '地点') { Scripts.value = ALLScripts.value }
    else if (newVal2 == '时间' && newVal3 == '事件类型') {
        Scripts.value = ALLScripts.value.filter(s => s.Place == newVal1)
    }
    else if (newVal1 == '地点' && newVal3 == '事件类型')
        Scripts.value = ALLScripts.value.filter(s => s.Time == newVal2)
    else if (newVal2 == '时间' && newVal1 == '地点')
        Scripts.value = ALLScripts.value.filter(s => s.type == newVal3)
    else if (newVal2 == '时间')
        Scripts.value = ALLScripts.value.filter(s => s.type == newVal3 && s.Place == newVal1)
    else if (newVal1 == '地点')
        Scripts.value = ALLScripts.value.filter(s => s.type == newVal3 && s.Time == newVal2)
    else if (newVal3 == '事件类型')
        Scripts.value = ALLScripts.value.filter(s => s.Time == newVal2 && s.Place == newVal1)
    else {
        Scripts.value = ALLScripts.value.filter(s => s.Time == newVal2 && s.Place == newVal1 && s.type == newVal3)
    }
});





onMounted(async () => {
    await db.open();
    const gameScripts = await db.gamescript.toArray();
    Scripts.value = gameScripts.map((script) => ({
        id: script.id || 0,
        Title: script.title || '',
        Description: script.description || '',
        Place: script.placename.replace(/\s/g, "") || '',
        Time: script.timename.replace(/\s/g, "") || '',
        type: script.typename.replace(/\s/g, "") || '',
    }));
    ALLScripts.value = Scripts.value
    const gameTimes = await db.time.toArray();
    Times.value = gameTimes.map((gameTimes) => ({
        id: gameTimes.id || 0,
        timename: gameTimes.timename.replace(/\s/g, "") || '',

    }));
    Times.value.push({ id: 0, timename: "时间" })
    const gamePlaces = await db.place.toArray();
    Places.value = gamePlaces.map((gamePlaces) => ({
        id: gamePlaces.id || 0,
        placename: gamePlaces.placename.replace(/\s/g, "") || '',

    }));
    Places.value.push({ id: 0, placename: "地点" })
    const gameTypes = await db.type.toArray();
    Types.value = gameTypes.map((gameTypes) => ({
        id: gameTypes.id || 0,
        typename: gameTypes.typename.replace(/\s/g, "") || '',
    }));
    Types.value.push({ id: 0, typename: "事件类型" })


    const history = await db.historyScript.orderBy('title').uniqueKeys()
    history.forEach(h => History.value.push(h as string));
   
})

const handleOption1Click = (value: any) => {

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
const showHistoryScript = () => {
    isOpen.value = true;

}
</script>