module.exports = {
    createMockReq () {
        return {
            body : {
                action : 'FooAction',
                method : 'bar',
                tid    : 1,
                type   : 'remoting',
                data   : []
            }
        };
    },

    createMockRes () {
        return {};
    }
};
