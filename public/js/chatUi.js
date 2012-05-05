"use strict";
(function (K, $) {
    var methods = {
        init: function (callback) {
            callback = callback || $.noop;
            var self = this;
            this.data('kwarqueChat', {
                windows : {},
                activeRoom : null,
                config : $.extend({
                    activeClass: 'active',
                    headerClass: 'header',
                    togglerClass: 'toggler',
                    infoIconClass: 'infoIcon',
                    closeIconClass: 'closeIcon',
                    privateClass: 'private',
                    publicClass: 'public',
                    statusClass: 'status',
                    containerClass: 'container'
                })
            });
            var d = this.data('kwarqueChat');
            methods.openWindow.call(self, {
                title : 'status',
                room : '~'
            }, callback());

            K.chat.on('message', $.proxy(methods.message, self));
            
            K.chat.on('clientJoined', function(msg) {
                methods.message.apply(self, [$.extend(msg, {
                    msg : msg.nick + ' has joined',
                    nick : 'sixth sense'
                })]);
            });
            K.chat.on('clientLeft', function(msg) {
                methods.message.apply(self, [$.extend(msg, {
                    msg : msg.nick + ' has left',
                    nick : 'sixth sense'
                })]);
            });
            methods.createAccordion.apply(this);
            $(this).find('.kwarque-chat-input').submit(function (e) {
                e.preventDefault();
                var messageNode = $(this).find('.kwarque-chat-message');
                var m = messageNode.val();
                messageNode.val("");
                K.chat.send(m, d.activeRoom, $.proxy(methods.message, self));
            });
            K.on("fragmentOpened", function(fragment) {
                fragment.room = "@fragment" + fragment.id;
                methods.openWindow.call(self, fragment);
            });
            return this;
        },

        authenticate : function(nick, password, callback) {
            var self = this;
            K.chat.authenticate(nick, password, function (response) {
                methods.message.call(self, {
                    room : '~',
                    nick : 'sixth sense',
                    msg  : 'authentication ' + (response === 'error' ? 'failed' : 'succeeded')
                });
                callback(response);
            });  
        },
        
        message: function(msg) {
            var d = this.data('kwarqueChat');
            if (msg.room in d.windows) {
                var container = d.windows[msg.room].container;
                var bottom = container.prop('scrollHeight') - container.innerHeight() - container.scrollTop();
                container.append(K.dce('p').text(msg.nick + ': ' + msg.msg));
                if (bottom === 0) {
                    container.scrollTop(container.prop('scrollHeight') - container.innerHeight());
                }
            }
            return this;
        },
        removeWindow: function (room, callback) {
            callback = callback || $.noop;
            this.accordion('destroy');
            var d = this.data('kwarqueChat');
            d.windows[room].header.remove();
            d.windows[room].container.remove();
            delete d.windows[room];
            if (room === d.activeRoom) d.activeRoom = '~';
            methods.createAccordion.apply(this);
            K.chat.leave(room, callback);
            this.data('kwarqueChat', d);
            return this;
        },
        createAccordion: function () {
            var d = this.data('kwarqueChat');
            this.accordion({
                active: d.activeRoom ? d.windows[d.activeRoom].pos: 0,
                change: methods.change,
                header: 'div.' + d.config.headerClass,
                autoHeight: false
            });
            return this;
        },
        change: function (event, ui) {
            var d = $(this).data('kwarqueChat');
            $(ui.oldHeader).removeClass(d.config.activeClass);
            $(ui.newHeader).addClass(d.config.activeClass);
            $.each(d.windows, function(room, elements) {
                if ($(elements.header).hasClass(d.config.activeClass)) {
                    d.activeRoom = room;
                    return false;
                } else {
                    return true;
                }
            });
            $(this).data('kwarqueChat', d);
            return this;
        },
        openWindow: function(room, callback) {
            callback = callback || $.noop;
            var d = this.data('kwarqueChat');
            var el = this;
            if (typeof d.windows[room.room] !== 'undefined') {
                var changeCallback = function() {
                    el.unbind("accordionchange", changeCallback);
                    callback();
                };
                el.bind("accordionchange", changeCallback);
                el.accordion("activate", d.windows[room.room].pos);
            } else {
                methods.createWindow.call(el, room, function(msg) {
                    methods.message.call(el, msg);
                    el.accordion("activate", d.windows[room.room].pos);
                    callback();
                });
            }
            return this;
        },
        createWindow: function (room, callback) {
            callback = callback || $.noop;
            var el = this;
            var d = this.data('kwarqueChat');
            K.chat.join(room.room, function(response) {
                var toggler = K.dce("a").addClass(d.config.togglerClass).text(room.title);
                var container = K.dce("div").addClass(d.config.containerClass);
                var header = K.dce("div").addClass(d.config.headerClass);
                var infoIcon = K.dce("span").addClass(d.config.infoIconClass);
                
                var closeIcon = K.dce("span").addClass(d.config.closeIconClass);
                closeIcon.click(function() {
                    methods.removeWindow.call(el, room.room);
                });
                header.append(toggler);
                header.append(infoIcon);
                header.append(closeIcon);
                var addClasses = function (cls) {
                    header.addClass(d.config[cls + 'Class']);
                    container.addClass(d.config[cls + 'Class']);
                }
                if (room.room === '~') {
                    // status
                    addClasses("status");
                } else if (room.room.match(/~/)) {
                    // private chat
                    addClasses("private");
                } else {
                    // public chat
                    addClasses("public");
                }
                el.accordion('destroy');
                d.windows[room.room] = {
                    header : header,
                    container : container,
                    pos : el.find('.' + d.config.headerClass).length
                }
                el.append(header);
                el.append(container);
                el.data('kwarqueChat', d);
                methods.createAccordion.apply(el);
                callback(response);
            });
            return this;
        }

    };

    $.fn.kwarqueChat = function () {
        return K.callPlugin(this, methods, arguments);
    };
}) (KWARQUE, jQuery);


