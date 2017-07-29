module.exports = {
    createFakeConnection ({
        loginSpy,  loginError,
        logoutSpy, logoutError,
        querySpy,  queryError, queryResult
    }) {
        class Connection {
            login (...args) {
                if (loginSpy) {
                    loginSpy(...args);
                }

                args[ 2 ](loginError);
            }

            logout () {
                return new Promise((resolve, reject) => {
                    if (logoutSpy) {
                        logoutSpy();
                    }


                    if (logoutError) {
                        reject(logoutError);
                    } else {
                        resolve();
                    }
                });
            }

            query (soql, callback) {
                if (querySpy) {
                    querySpy(soql, callback);
                }

                callback(queryError, queryResult);
            }
        }

        return {
            Connection
        }
    },

    createFakeSoap ({ invokeSpy, invokeError, invokeResult }) {
        class Soap {
            invoke (...args) {
                if (invokeSpy) {
                    invokeSpy(...args);
                }

                args[3](invokeError, invokeResult);
            }
        }

        return Soap;
    }
};
