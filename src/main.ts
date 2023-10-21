import "./style.css";
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import "element-plus/theme-chalk/dark/css-vars.css";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
const app = createApp(App)


app.use(router)
app.use(ElementPlus)
app.mount('#app')
