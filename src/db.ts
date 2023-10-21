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

class MyDatabase extends Dexie {
  place: Dexie.Table<Place, number>;
  time: Dexie.Table<Time, number>;
  type: Dexie.Table<Type, number>;
  gamescript: Dexie.Table<GameScript, number>;
  constructor() {
    super('myDatabase');
    this.version(31).stores({
      Place: '++id, placename',
      Time: '++id,timename',
      Type: '++id,typename',
      GameScript: '++id,title,description,placename,timename,typename'
    });

    this.place = this.table('Place');
    this.time = this.table('Time');
    this.type = this.table('Type');
    this.gamescript = this.table('GameScript')

    // this.on('populate', () => {
    //   this.transaction('rw', this.place, this.time, this.type, this.gamescript, async () => {
    //     await this.place.add({ placename: " 学校" });
    //     await this.place.add({ placename: " 医院" });
    //     await this.place.add({ placename: " 家里" });

    //     await this.time.add({ timename: " 古代" });
    //     await this.time.add({ timename: " 现代" });
    //     await this.time.add({ timename: " 未来" });

    //     await this.type.add({ typename: " 爱情" });

    //     await this.gamescript.add({ title: "test1", description: "This is a test1", placename: " 学校", timename: "现代", typename: " 爱情" });
    //     await this.gamescript.add({ title: "test2", description: "This is a test2", placename: " 学校", timename: "现代2", typename: " 爱情" });
    //     await this.gamescript.add({ title: "test3", description: "This is a test3", placename: " 学校", timename: "现代", typename: " 爱情" });

    //   })

    // });
  }

}
export const db = new MyDatabase();

export async function clearData() {
  db.gamescript.clear();
  db.place.clear();
  db.time.clear();
  db.type.clear();
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
      { timename: " 古代2" },
      { timename: " 古代3" },
    ]).then(function () {
      console.log('time初始化数据添加成功');
    }).catch(function (error) {
      console.error(error.stack || error);
    });

    db.type.bulkAdd([
      { typename: " 爱情" }
    ]).then(function () {
      console.log('type初始化数据添加成功');
    }).catch(function (error) {
      console.error(error.stack || error);
    });

    db.gamescript.bulkAdd([
      { title: "test1", description: "This is a test1", placename: " 学校", timename: "现代", typename: " 爱情" },
      { title: "test1", description: "This is a test1", placename: " 医院", timename: "现代", typename: " 爱情" },
      { title: "test1", description: "This is a test1", placename: " 学校", timename: "现代", typename: " 爱情" },
    ]).then(function () {
      console.log('gamescript初始化数据添加成功');
    }).catch(function (error) {
      console.error(error.stack || error);
    });

  }
})