const store = require("react-native-simple-store");
export class MessageDAL_Native {
    getData(rid) {
        return store.get(rid);
    }
    saveData(rid, chatRecord) {
        return store.save(rid, chatRecord).then(() => {
            return store.get(rid);
        });
    }
    removeData(rid, callback) {
    }
    clearData(next) {
    }
}
