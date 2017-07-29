/* eslint-disable */
(function (win) {
    var document = win.document,
        Fiddle   = function (config) {
            var me = this;

            me.activeType = config.activeType;
            me.assets     = me.parseAssets(config.assets);
            me.id         = config.id;
            me.readOnly   = config.readOnly;

            me.lastActive = {
                css        : 0,
                data       : 0,
                html       : 0,
                javascript : 0
            };

            me.tabs = {
                css        : 0,
                data       : 0,
                html       : 0,
                javascript : 0,
                preview    : 0
            };

            if (config.el) {
                me.initEditor(config.el, config.initialType);
            }
        },
        proto    = Fiddle.prototype,
        editor, fileBar, filePicker, iframe, wrapper;

    proto.modes = {
        css        : 'ace/mode/css',
        data       : 'ace/mode/javascript',
        javascript : 'ace/mode/javascript',
        js         : 'ace/mode/javascript',
        html       : 'ace/mode/html'
    };

    proto.initEditor = function (el, initialType) {
        var aceEditor = this.editor = ace.edit(el);

        //gets rid of Ace Editor warning
        aceEditor.$blockScrolling = Infinity;

        if (this.readOnly) {
            aceEditor.setReadOnly(true);
        }

        if (initialType) {
            aceEditor.getSession().setMode(initialType);
        }
    };

    proto.parseAssets = function (assets) {
        var html   = assets.html,
            i      = 0,
            length = html.length,
            el, asset;

        if (length) {
            el = document.createElement('textarea');

            for (; i < length; i++) {
                asset = html[ i ];

                el.innerHTML = asset.code;

                asset.code = el.value;
            }
        }

        return assets;
    };

    proto.getEditor = function () {
        return editor || (editor = document.getElementById('editor'));
    };

    proto.getFileBar = function () {
        return fileBar || (fileBar = document.getElementById('file-bar'));
    };

    proto.getFilePicker = function () {
        return filePicker || (filePicker = document.getElementById('file-picker'));
    };

    proto.getIframe = function (createNew) {
        var wrapper = this.getWrapper();

        if (iframe) {
            wrapper.removeChild(iframe);

            iframe = null;
        }

        if (createNew || !iframe && createNew !== false) {
            iframe = document.createElement('iframe');

            wrapper.appendChild(iframe);
        }

        return iframe;
    };

    proto.getWrapper = function () {
        return wrapper || (wrapper = document.getElementById('fiddle'));
    };

    proto.getTab = function (type) {
        var tabs = this.tabs,
            tab  = tabs[ type ];

        if (!tab) {
            tab = tabs[ type ] = document.getElementById(`tab-${type}`);
        }

        return tab;
    };

    proto.getOtherTabs = function (exclude) {
        var tabs = this.tabs,
            arr  = [],
            type, tab;

        for (type in tabs) {
            if (type !== exclude) {
                tab = this.getTab(type);

                tab && arr.push(this.getTab(type));
            }
        }

        return arr;
    };

    proto.getLastActive = function (type) {
        return this.lastActive[ type ] || this.setLastActive(type, this.assets[ type ][ 0 ].name);
    };

    proto.setLastActive = function (type, name) {
        return this.lastActive[ type ] = name;
    };

    proto.removeCls = function (el, cls) {
        if (el) {
            var classes  = el.classList || el.className.split(' '),
                i        = 0,
                length   = classes.length,
                newClass = [];

            for (; i < length; i++) {
                if (classes[ i ] !== cls) {
                    newClass.push(classes[ i ]);
                }
            }

            el.className = newClass.join(' ');
        }

        return el;
    };

    proto.addCls = function (el, cls) {
        if (el) {
            var classes = el.classList ? Array.prototype.slice.call(el.classList) : el.className.split(' ');

            if (classes.indexOf(cls) < 0) {
                classes.push(cls);
            }

            el.className = classes.join(' ');
        }

        return el;
    };

    proto.updateFilePicker = function (type) {
        var picker = this.getFilePicker(),
            active = this.getLastActive(type),
            files  = this.assets[ type ],
            i      = 0,
            length = files.length,
            file, option;

        if (picker && length > 1) {
            while (picker.firstChild) {
                picker.removeChild(picker.firstChild);
            }

            for (; i < length; i++) {
                file   = files[ i ];
                option = document.createElement('option');

                option.innerHTML = file.name;

                if (file.name === active) {
                    option.selected = true;
                }

                picker.appendChild(option);
            }
        }
    };

    proto.setActiveTab = function (type) {
        var active = this.getTab(type),
            other  = this.getOtherTabs(type),
            i      = 0,
            length = other.length,
            tab;

        for (; i < length; i++) {
            tab = other[ i ];

            this.removeCls(tab, 'tab-active');
        }

        this.addCls(active, 'tab-active');
    };

    proto.getAsset = function (type, name) {
        var files  = this.assets[ type ],
            i      = 0,
            length = files.length,
            file;

        for (; i < length; i++) {
            file = files[ i ];

            if (file.name === name) {
                return file;
            }
        }
    };

    proto.onTabClick = function (type) {
        var me = this,
            editor, fileBar, asset;

        if (type !== me.activeType) {
            var editor  = me.getEditor(),
                fileBar = me.getFileBar(),
                asset   = me.getAsset(type, me.getLastActive(type));

            me.getIframe(false); // will remove the iframe
            me.setActiveTab(type);

            me.editor.setValue(type === 'data' ? asset.data : asset.code, -1);
            me.editor.getSession().setMode(me.modes[ type ]);

            me.removeCls(editor,  'display-hidden');
            me.removeCls(fileBar, 'display-hidden');

            me.updateFilePicker(type);

            me.activeType = type;
        }
    };

    proto.onFileChange = function (el) {
        var me     = this,
            name   = el.value,
            files  = me.assets[ me.activeType ],
            i      = 0,
            length = files.length,
            file;

        me.setLastActive(me.activeType, name);

        for (; i < length; i++) {
            file = files[ i ];

            if (file.name === name) {
                me.editor.setValue(file.code, -1);

                break;
            }
        }
    };

    proto.runPreview = function () {
        var me      = this,
            iframe  = me.getIframe(true),
            editor  = me.getEditor(),
            fileBar = me.getFileBar();

        me.addCls(editor,  'display-hidden');
        me.addCls(fileBar, 'display-hidden');

        me.setActiveTab('preview');

        iframe.src = `/fiddle/${me.id}/preview`;

        me.activeType = 'preview';
    };

    if (win && !win.Fiddle) {
        win.Fiddle = Fiddle;
    }
})(window);
