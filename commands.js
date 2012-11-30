var rainbowDriver = rainbowDriver || {};

(function () {
    "use strict";

    rainbowDriver.commands = {
        findElement: function findElement(data) {
            var element = document.querySelector(data.selector);

            if (element) {
                return JSON.stringify({
                    name: 'findElement',
                    elementId: new Date().getTime(),
                    selector: data.selector,
                    status: 0
                });
            } else {
                return JSON.stringify({
                    name: 'findElement',
                    status: 7,
                    selector: data.selector
                });
            }
        },

        getElementAttribute: function findElement(data) {
            var element = document.querySelector(data.selector);

            if (!element) {
                return false;
            }
            else {
                var response = JSON.stringify({
                    name: 'getElementAttribute',
                    value: element.getAttribute(data.attribute)
                });
                return response;
            }
        },

        click: function clickElement(data) {
            var element = document.querySelector(data.selector),
                rect = element.getClientRects()[0],
                event;

            if (!element) {
                return false;
            }

            event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 1,
                (rect.left + element.clientWidth / 2),
                (rect.top + element.clientHeight / 2),
                (rect.left + element.clientWidth / 2),
                (rect.top + element.clientHeight / 2),
                false, false, false, false, /* keys */
                0, /* button */
                element);

            element.dispatchEvent(event);
            
            return true;
        },

        getTitle: function getTitle(data) {
            var response = JSON.stringify({
                name: 'getTitle',
                value: document.title
            });

            return response;
        },

        getValue: function getValue(data) {
            var element = document.querySelector(data.selector);

            if (!element) {
                return false;
            }
       
            var response = JSON.stringify({
                name: 'getElementText',
                value: element.textContent
            });

            return response;
        },

        getName: function getName(data) {
            var element = document.querySelector(data.selector);

            if (!element) {
                return false;
            }
       
            var response = JSON.stringify({
                name: 'getElementTagName',
                value: element.tagName
            });

            return response;
        },

        sendKeysToElement: function sendKeysToElement(data) {
            var element = document.querySelector(data.selector);

            if (!element) {
                return false;
            }

            element.value = data.value;

            var response = JSON.stringify({
                name: 'sendKeysToElement',
                status: 0,
                value: ""
            });

            return response;
        }
    };

})();
