module.exports = {
    createFakeQuery ({ resolveWith, rejectWith }) {
        class Query {
            then (resolveCb, rejectCb) {
                return new Promise((resolve, reject) => {
                    if (rejectWith) {
                        if (!(rejectWith instanceof Error)) {
                            rejectWith = new Error(rejectWith);
                        }

                        reject(rejectWith);
                        rejectCb(rejectWith);
                    } else {
                        resolve(resolveWith);
                        resolveCb(resolveWith);
                    }
                });
            }
        }

        return Query;
    }
};
