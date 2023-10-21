<template>
    <el-card >
        <div>
            <div>
                <el-text type="primary	">标题： {{ title }}</el-text>
            </div>
            <div>
                <el-text type="primary">描述： {{ description }}</el-text>
            </div>
            <div class="mt-8 text-sm">
                
                <el-text type="primary">#{{ time }} #{{ place }} #{{type}}</el-text>
            
            </div>
            <div class="grid">
              <div class="justify-self-end">
                <el-button @click="gotoGame(description,title)">开始游戏</el-button>
            </div>  
            </div>
            

        </div>
    </el-card>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
defineProps<{
    title?: string
    scriptId?: number
    description?: string
    place?: string
    time?: string
    type?: string
}>()
const gotoGame = (des:any,title:any) => {
   router.push({
        path:'/game',
        query:{description:des, title:title}
    })
}

</script>
