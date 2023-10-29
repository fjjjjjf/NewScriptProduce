import axios from 'axios';
import { ElMessage, descriptionProps } from 'element-plus';
import { ref } from 'vue';
import { db } from "@/db"

// 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
export const checkApiKey = async (openAIkey: string): Promise<Boolean> => {
    try {
        const response = await axios.get("https://api.openai.com/v1/models", {
            headers: {
                'Authorization': `Bearer ${openAIkey}`
            }
        })
        if (response.status === 200) {

            ElMessage({
                message: "API Key 成功。",
                type: 'success',
            });
            try {
                await db.open();
                const firtRecord = await db.Apikey.toCollection().first();
                if (firtRecord) {
                    await db.Apikey.update(firtRecord.id as number, { apikey: openAIkey });
                } else {
                    await db.Apikey.add({
                        apikey: openAIkey,
                        model: "",
                    });
                }
            } finally {
                db.close();
            }
            
            return true;

        } else {
            ElMessage({
                message: "API Key 验证失败，请检查您的 API Key 是否正确。",
                type: "error",
            });
            return false;
        }
    } catch (Error) {
       
        ElMessage({
            message: "API Key 验证失败，请检查您的 API Key 是否正确。",
            type: "error",
        });
        return false;
    }
}

export const checkmodel = async (modelid: string, apikey: string): Promise<Boolean> => {
   
    const model = ref("");
    if (modelid == "0") {
        model.value = "gpt-3.5-turbo"
    }
    else {
        model.value = "gpt-4";
    }
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        messages: [{ role: "system", content: "You are a helpful assistant." }],
        model: model.value,
    }, {
        headers: {
            'Authorization': `Bearer ${apikey}`
        }
    })

    if (response.status == 200) {
        ElMessage({
            message: "模型选择成功！！，您可以进行下一步操作",
            type: "success",
        });
        try {
            await db.open();
            const firtRecord = await db.Apikey.toCollection().first();
            if (firtRecord) {
                await db.Apikey.update(firtRecord.id as number, { model: model.value });
            } else {
                await db.Apikey.add({
                    apikey: "",
                    model: model.value,
                });
            }
        } finally {
            db.close();
        }
        return true;
    }
    else {
        ElMessage({
            message: "模型选择失败，没有该模型权限",
            type: "error",
        });

        return false
    };
}

export const checkword = async (type: string, input: string, apikey: string): Promise<Boolean> => {
    if (apikey == '') {
        ElMessage({
            message: "您还未输入apikey，暂时不能使用该服务",
            type: "error",
        });
        return false;
    }
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            messages: [{ role: "system", content: input + " 是不是" + type + "，回答Y 或者 N" }],
            model: "gpt-3.5-turbo",
        }, {
            headers: {
                'Authorization': `Bearer ${apikey}`
            }
        })
      
        if (response.status === 200) {
          

            if (response.data.choices[0].message.content == "Y") {
                ElMessage({
                    message: input + "是" + type + "类型，现在将其添加进数据库",
                    type: "success",
                });

                try {
                    await db.open();
                    if (type == "时间") {
                        await db.time.add({
                            timename: input,
                        });
                    } else if (type == "地点") {
                        await db.place.add({
                            placename: input,
                        });
                    }
                    else {
                        await db.type.add({
                            typename: input,
                        });
                    }
                } finally {
                    db.close();
                }

                return true;
            }
            else {
                ElMessage({
                    message: "你输入的根据AI判定并不是符合的类型，您可以重新输入",
                    type: "error",
                });
                return false;
            }
        }
        else {
            ElMessage({
                message: "网络出现错误，请重试",
                type: "error",
            });
            return false;
        }
    } catch (Error) {
      
        ElMessage({
            message: "网络出现错误，请重试",
            type: "error",
        });
        return false;
    }
}


export const createNewScript = async (type1: string, type2: string, type3: string, apikey: string, model: string): Promise<string> => {
    if (apikey == '') {
        ElMessage({
            message: "您还未输入apikey，暂时不能使用该服务",
            type: "error",
        });
        return '';
    }
    else if (model == '') {
        ElMessage({
            message: "您还未选择AI模型，暂时不能使用该服务",
            type: "error",
        });
    }
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            messages: [{ role: "user", content: "我现在要创建一个游戏扮演剧本，时间发生在" + type1 + " ，事件类型是" + type2 + "，地点发生在" + type3 + "，请创造出一个游戏背景描述，返回格式是{   description:string, title:string} 其中description内容在40字左右，并且要交代出故事的核心" }],
            model: model,
        }, {
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Accept': 'application/json'
            }
        })
     
        if (response.status === 200) {
            const contentJson = JSON.parse(response.data.choices[0].message.content);


            try {
                await db.open();
                db.gamescript.add({
                    title: contentJson.title,
                    description: contentJson.description,
                    placename: type3,
                    timename: type1,
                    typename: type2,
                })
            } finally {
                db.close();
            }

            return contentJson.description;
        }
        else {
            ElMessage({
                message: "网络出现错误，请重试",
                type: "error",
            });
            return '';
        }
    } catch (Error) {
      
        ElMessage({
            message: "网络出现错误，请重试",
            type: "error",
        });
        return '';
    }
}

// const background1=ref(' 我想让你和我玩文字冒险游戏，这个游戏的背景是，')
// const background2 =ref('请注意构造的情节要丰富且符合现实逻辑。请你只以json的形式返回当前的故事进展（意味着这个json里面只有一个story字段，一个choice字段和一个round字段），这个json包含三个字段。类似这样的结构{"story": "","choice": [{A:""},{B:""},{C:""},{D:""},],"round": 10}其中story字段是故事发展的叙述。另一个字段choice是一个数组，包含四个不同的选项编号分别为ABCD（如果游戏结束则choice内部的只有null一个值），每次回复请给我四个选项，这些选项中存在着错误的陷阱选项，选择这些选项可能会导致游戏直接走向坏结局（即游戏结束），每个不同的选项将以不同的方式推动剧情的进展，在没有找到充足的证据之前无法揭露凶手。最后一个字段是round，它代表剩余的回合数，初始时round=10，用户每进行一次选择都会减1，每次生成回答的时候要根据当前的还剩余的round来有序的推动剧情发展，切记当round=0时，将触发结局的剧情，切记请根据用户之前的选择生成一个合理的结局剧情放在story字段（结局剧情提示：主角可能因为某种原因遇到危险死亡或者因为某个机会找到了凶手或者是因为调查的太久案件以失败告终），游戏结束。后续我将输入选项的编号，代表我选择了这个选项，根据我的选择来生成下一步的json。')
interface StoryData {
    story: string;
    choice: string[];

}
const s: StoryData = {
    story: '',
    choice: [''],

}
interface message {
    role: string,
    content: string,
}[]
export const createStory = async (description: string, apikey: string, model: string): Promise<StoryData> => {
    if (apikey == '') {
        ElMessage({
            message: "您还未输入apikey，暂时不能使用该服务",
            type: "error",
        });
        return s;
    }
    else if (model == '') {
        ElMessage({
            message: "您还未选择AI模型，暂时不能使用该服务",
            type: "error",
        });
        return s;
    }
    
    const MessageArray = description.split("\n");
    const filteredArray = MessageArray.filter(str => str !== "");
    const mess: message[] = []
    mess.push({
        role: 'system', content: filteredArray[0]
    })
    const round= 15-(filteredArray.length-2)/2
    for (let i = 1; i < filteredArray.length; i++) {
        if (i % 2 != 0 && i != filteredArray.length - 1) {
            mess.push(
                {
                    role: 'assistant',
                    content: filteredArray[i],
                }
            )
        }
        else if(i % 2 == 0 && i != filteredArray.length - 1) {
            mess.push(
                {
                    role: 'user',
                    content:filteredArray[i],
                }
            )
        }
        else  {
            mess.push(
                {
                    role: 'user',
                    content: "还剩下"+round+"回合，请在1回合时结束。"+filteredArray[i],
                }
            )
        }

    }
    if(round<=0)
    {
       
        return {
            story:filteredArray[filteredArray.length-2]+"(由于回合数的限制，我们现在将强制性结束游戏)",
            choice:['游戏结束了！']
        }
    }
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            messages: mess,
            model: model,
        }, {
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Accept': 'application/json'
            }
        })
        const jsonMatch = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const jsonString = jsonMatch[0];
           

            return JSON.parse(jsonString);


        }
        else{
            
            const  choicesText = response.data.choices[0].message.content.split(/(\n)?\n(?=[ABCD]\.)/);
          
            // const options = choicesText.trim().split(/\n/).map((option: string) => {
            //     const matches = option.match(/^([ABCD])\.\s(.*)/);
            //     if (matches && matches.length === 3) {
            //       const id = matches[1]; // 选项标识 (A, B, C, D)
            //       const text = matches[2]; // 选项文本
            //       return { id, text };
            //     }
            //     return null; // 无效的选项
            //   }).filter((option: null) => option !== null); // 过滤掉无效选项

              const storyData: StoryData = {
                story: choicesText[0],
                choice: choicesText.slice(1).filter((item: string | undefined) => (item !== '\n')&&(item !== undefined))
              };
            //   storyData.choice = options.reduce((acc: { [x: string]: any; }, option: { id: string ; text: any; }) => {
            //     acc[option.id] = option.text;
            //     return acc;
            //   }, {} as { [key: string]: string });
              return storyData
        }


    } catch (Error) {
       
        ElMessage({
            message: "AI数据格式返回错误，重新生成中，请耐心等待",
            type: "error",
        });
        createStory(description, apikey, model);
    }

}