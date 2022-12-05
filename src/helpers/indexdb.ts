const dbBin: any = {};

async function openDB(dbName: string): Promise<any>{
    return new Promise(
      function(resolve, reject) {
        var request = indexedDB.open(dbName, 1);
  
        request.onerror = function(event) {
          // @ts-ignore
          if (event.target.errorCode == "VER_ERR") {}
          reject(Error("FAILED OPENING"));
        };
  
        request.onupgradeneeded = function(event) {
          // @ts-ignore
          const db = event.target.result;

          const objectStore = db.createObjectStore("puzzles", { keyPath: "puzzle_id"});
          objectStore.createIndex("puzzle_type", ["type"], { unique: false });
        };
  
        request.onsuccess = function(event) {
          // @ts-ignore
          dbBin[dbName] = event.target.result;
          resolve(true);
        };
      }
    );
}

export async function writeDB(dbName: string, dt: any): Promise<any> {
  if (!dt.puzzle_id) {
    return Promise.reject("NEED PUZZLE ID");
  }

  if (!dbBin[dbName]) {
    await openDB(dbName);
  }

  return new Promise(
    function(resolve, reject) {
      const request = dbBin[dbName].transaction(["puzzles"], "readwrite")
        .objectStore("puzzles")
        .put(dt);
  
      request.onerror = function() {
        reject(false);
      };
  
      request.onsuccess = function() {
        resolve(true);
      };

    }
  );
}

export async function deleteDB(dbName: string, puzzle_id: string): Promise<any> {
  if (!dbBin[dbName]) {
    await openDB(dbName);
  }

  return new Promise(
    function(resolve, reject) {
      const request = dbBin[dbName].transaction(["puzzles"], "readwrite")
        .objectStore("puzzles")
        .delete(puzzle_id); 
          
      request.onerror = function() {
        reject(false);
      };
  
      request.onsuccess = function(event: any) {
        resolve(true);
      };

    }
  );
}

export async function getDBbyId(dbName: string, puzzle_id: string, indexName: string): Promise<any> {
  if (!dbBin[dbName]) {
    await openDB(dbName);
  }

  return new Promise(
    function(resolve, reject) {
      const os = (indexName == "") ? 
        dbBin[dbName].transaction(["puzzles"], "readonly").objectStore("puzzles") : 
        dbBin[dbName].transaction(["puzzles"], "readonly").objectStore("puzzles").index(indexName);

      const request = os.get(puzzle_id);
  
      request.onerror = function() {
        resolve(undefined);
      };
  
      request.onsuccess = function(event: any) {
        resolve(event.target.result);
      };
    }
  );
}

export async function updateDBbyId(dbName: string, puzzle_id: string, upd: any): Promise<any> {0
  if (!dbBin[dbName]) {
    await openDB(dbName);
  }

  return new Promise(
    function(resolve, reject) {
      const os = dbBin[dbName].transaction(["puzzles"], "readwrite").objectStore("puzzles");
      const request = os.get(puzzle_id); 

      request.onsuccess = ()=> {
        const dt = request.result;
        if (dt) {
          Object.keys(upd).forEach(key => {
            dt[key] = upd[key];
          });
  
          const updateRequest = os.update(dt);
  
          updateRequest.onerror = () => {
            reject("FAIL UPDATE");
          }
  
          updateRequest.onsuccess = () => {
            resolve(true);
          }
        } else {
          resolve(true);
        }
  
        request.onerror = () => {
          resolve(false);
        }
  
      }
    }
  );
}

async function countPageDB(dbName: string, getParams: any): Promise<any> {
  if (!dbBin[dbName]) {
    await openDB(dbName);
  }

  return new Promise(
    function(resolve, reject) {
      const request = dbBin[dbName].transaction(["puzzles"], "readwrite").objectStore("puzzles").count();

      request.onsuccess = () => {
        resolve(Math.ceil(request.result/getParams.limit));
      }
      
      request.onerror = () => {
        resolve(0);
      }
  })
}

export async function getPageDB(dbName: string, getParams: any): Promise<any> {
  if (!dbBin[dbName]) {
    await openDB(dbName);
  }

  if (!getParams.page) {
    getParams.page = 1;
  } else if (getParams.page < 1){
    getParams.page = 1;
  }
    
  if (!getParams.limit) {
    getParams.limit = 5;
  }

  const count = await countPageDB(dbName, getParams);

  return new Promise(
    function(resolve, reject) {
      const os = dbBin[dbName].transaction(["puzzles"], "readwrite").objectStore("puzzles");
      const request = os.openCursor(null, 'prev'); 
      const results: any[] = [];

      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
  
        if (cursor && (results.length < getParams.limit)) {
          results.push({
            type: cursor.value.type,
            puzzle_id: cursor.value.puzzle_id,
            creator_id: cursor.value.creator_id,
            thumbnail: cursor.value.thumbnail,
            username: cursor.value.username,
            hidden: cursor.value.hidden,
            completed: cursor.value.completed,
            favourited: cursor.value.favourited,
            saved: true
          });
          cursor.continue();
        } else {
          resolve({
            data: results,
            pages: count
          });
        }
      };

      request.onerror = () => {
        resolve({
          data: [],
          pages: 0
        });
      }
    }
  );  
}