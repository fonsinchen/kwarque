"use strict";
(function ($) {
    var dce = function(name) {
        return $(document.createElement(name));
    };
	var methods = {
        init: function (uconfig) {
            var self = this;
            this.data('accChat', {
            	chat : new KwarqueChat,
	            windows : {},
	            activeRoom : null,
            	config : $.extend({
		            activeClass: 'active',
            		headerClass: 'header',
                    togglerClass: 'toggler',
                    infoIconClass: 'infoIcon',
                    privateClass: 'private',
                    publicClass: 'public',
                    statusClass: 'status',
                    inputFormClass: 'chatInput',
                    inputMessageClass: 'chatMessage'
            	}, uconfig)
            });
            var d = this.data('accChat');

		    d.chat.authenticate(d.config.nick, d.config.password, function (response1) {
                d.activeRoom = response1.room;
                self.data('accChat', d);
				methods.createWindow.apply(self, [response1.room, function (response2) {
                    methods.message.apply(self, [response1]);
                    methods.message.apply(self, [response2]);
                }]);
	    	});
            d.chat.on('message', $.proxy(methods.message, self));
		    methods.createAccordion.apply(this);
            $('.' + d.config.inputFormClass).submit(function (e) {
        		e.preventDefault();
                var messageNode = $($(this).find('.' + d.config.inputMessageClass));
		        var m = messageNode.val();
        		messageNode.val("");
		        d.chat.send(m, d.activeRoom, $.proxy(methods.message, self));
        	});
            return this;
        },
        message: function(msg) {
            var d = this.data('accChat');
            d.windows[msg.room].container.append(
                dce('p').text(msg.nick + ': ' + msg.msg)
            );
        },
		removeWindow: function (room) {
			this.accordion('destroy');
            var d = this.data('accChat');
			d.windows[room].header.remove();
			d.windows[room].container.remove();
            delete d.windows[room];
			methods.createAccordion.apply(this);
			d.chat.leave(room);
            this.data('accChat', d);
            return this;
		},
		createAccordion: function () {
            var d = this.data('accChat');
			this.accordion({
				active: d.activeRoom ? d.windows[d.activeRoom].pos: 0,
				change: methods.change,
				header: 'div.' + d.config.headerClass
			});
            return this;
		},
		change: function (event, ui) {
            var d = this.data('accChat');
			$(ui.oldHeader).removeClass(d.config.activeClass);
			$(ui.newHeader).addClass(d.config.activeClass);
            $.each(d.windows, function(room, elements) {
                if ($(elements.header).hasClass(d.config.activeClass)) {
                    d.activeRoom = room;
                    return false;
                }
            });
            this.data('accChat', d);
            return this;
		},
        createWindow: function (room, callback) {
            var el = this;
            var d = this.data('accChat');
            d.chat.join(room, function(response) {
                var toggler = dce("a").addClass(d.config.togglerClass);
		        var container = dce("div");
        		var header = dce("div").addClass(d.config.headerClass);
        		var infoIcon = dce("div").addClass(d.config.infoIconClass);
                header.append(infoIcon);
                header.append(toggler);
                var addClasses = function (cls) {
                    header.addClass(d.config[cls + 'Class']);
                    container.addClass(d.config[cls + 'Class']);
                }
                if (room === '~' + d.nick) {
                    // status
                    addClasses("status");
                } else if (room.match(/~/)) {
                    // private chat
                    addClasses("private");

                } else {
                    // public chat
                    addClasses("public");
                }
                el.accordion('destroy');
                d.windows[room] = {
                    header : header,
                    container : container,
                    pos : el.children().length / 2
                }
                el.append(header);
                el.append(container);
                el.data('accChat', d);
                methods.createAccordion.apply(el);
                callback(response);
            });
        }

	};
	$.fn.accChat = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.accChat');
		}
	};
}) (jQuery);


