// db.ts

import Dexie from 'dexie';

interface Place {
  id?: number;
  placename: string;
}
interface Time {
  id?: number;
  timename: string;
}
interface Type {
  id?: number;
  typename: string;
}
interface GameScript {
  id?: number;
  title?: string;
  description?: string;
  placename: string;
  timename: string;
  typename: string;
}

interface Apikey {
  id?: number;
  apikey: string;
  model: string
}


class MyDatabase extends Dexie {
  place: Dexie.Table<Place, number>;
  time: Dexie.Table<Time, number>;
  type: Dexie.Table<Type, number>;
  gamescript: Dexie.Table<GameScript, number>;
  Apikey: Dexie.Table<Apikey, number>;
  constructor() {
    super('myDatabase');
    this.version(35).stores({
      Apikey: '++id, apikey,model',
      Place: '++id, placename',
      Time: '++id,timename',
      Type: '++id,typename',
      GameScript: '++id,title,description,placename,timename,typename'
    });

    this.Apikey = this.table('Apikey');
    this.place = this.table('Place');
    this.time = this.table('Time');
    this.type = this.table('Type');
    this.gamescript = this.table('GameScript')

    this.on('populate', () => {
      this.transaction('rw', this.place, this.time, this.type, this.gamescript, async () => {
        await this.place.add({ placename: " 学校" });
        await this.place.add({ placename: " 医院" });
        await this.place.add({ placename: " 家里" });

        await this.time.add({ timename: " 古代" });
        await this.time.add({ timename: " 现代" });
        await this.time.add({ timename: " 未来" });

        await this.type.add({ typename: " 爱情" });
        await this.type.add({ typename: " 友情" });
        await this.type.add({ typename: " 冒险" });

        // await this.gamescript.add({ title: "test1", description: "This is a test1", placename: " 学校", timename: "现代", typename: " 爱情" });
        // await this.gamescript.add({ title: "test2", description: "This is a test2", placename: " 学校", timename: "现代2", typename: " 爱情" });
        // await this.gamescript.add({ title: "test3", description: "This is a test3", placename: " 学校", timename: "现代", typename: " 爱情" });

      })

    });
  }

}
export const db = new MyDatabase();

export async function clearData() {
  db.gamescript.clear();
//  db.place.clear();
//  db.time.clear();
// db.type.clear();

  db.close();
}

db.transaction('rw', db.place, db.time, db.type, db.gamescript, async function () {
  
  if (await db.place.count() == 0 && await db.time.count() == 0 && await db.type.count() == 0 && await db.gamescript.count() == 0) {
    db.place.bulkAdd([
      { placename: " 学校" },
      { placename: " 医院" },
      { placename: " 家" },
    ]).then(function () {
      console.log('place初始化数据添加成功');
    }).catch(function (error) {
      console.error(error.stack || error);
    });

    db.time.bulkAdd([
      { timename: " 古代" },
      { timename: " 现代" },
      { timename: " 未来" },
    ]).then(function () {
      console.log('time初始化数据添加成功');
    }).catch(function (error) {
      console.error(error.stack || error);
    });

    db.type.bulkAdd([
      { typename: " 爱情" },
      { typename: " 友情" },
      { typename: " 冒险" }

    ]).then(function () {
      console.log('type初始化数据添加成功');
    }).catch(function (error) {
      console.error(error.stack || error);
    });

    db.gamescript.bulkAdd([
      { title: "绮梦之恋", description: "在远古时代的家中，主人公扮演的年轻贵族意外发现了一本神秘的书册，以此为契机，她邂逅了一位来自异域的神秘男子。他们之间的相遇和他们渴望逃离束缚的爱情将是故事的核心。", placename: " 家 ", timename: "古代 ", typename: " 爱情" },
      { title: "未来学校之友情奇遇", description: "在未来，人类创造出了先进的虚拟学校系统。玩家扮演一位特殊能力少年，与来自全世界的好友们一同探索学校的未知秘密，解开学校独特事件，拯救彼此的友情。", placename: " 学校 ", timename: "未来 ", typename: " 友情" },
      { title: " 病房迷踪", description: "在一家现代医院，主角醒来后发现自己处于一种神秘的病房。为了逃出医院并揭开谜团，他必须解密秘密实验、不可思议的药物和隐藏在角落的危险。", placename: " 医院 ", timename: "现代", typename: " 冒险" },
    ]).then(function () {
      console.log('gamescript初始化数据添加成功');
    }).catch(function (error) {
      console.error(error.stack || error);
    });

  }
}
)