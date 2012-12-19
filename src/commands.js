var rainbowDriver = rainbowDriver || {};

(function () {
    "use strict";

    rainbowDriver.commands = {
        executeScript: function executeScript(data) {
            var result = eval(data.script);

            return JSON.stringify({
                name: 'executeScript',
                status: 0,
                value: result
            });
        },

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

        isElementDisplayed: function isElementDisplayed(data) {
            var element = document.querySelector(data.selector);

            return JSON.stringify({
                name: 'isElementDisplayed',
                status: 0,
                value: element.offsetHeight > 0
            });
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

        getSelected: function getSelected(data) {
            var element = document.querySelector(data.selector);                

            if (!element) {
                return false;
            }

            if (element.tagName === 'INPUT' && element.type === 'checkbox') {
                var selected = element.checked;
            }

            return JSON.stringify({
                name: 'getSelected',
                status: 0,
                value: selected
            });
        },

        sendKeysToElement: function sendKeysToElement(data) {
            var element = document.querySelector(data.selector),
               inputValue = data.value;

            if (!element) {
                return false;
            }

            function fireKeyEvent(type, keyValue) {
                var keyEvent,
                    keyCharCode = keyValue.charCodeAt(0),
                    charCode_to_keyCode_map;

                //Special characters which have different ASCII code and event key code
                charCode_to_keyCode_map = {
                    '44': 188, //comma
                    '59': 186, //semicolon
                    '64': 50  //@
                };

                if (keyCharCode >= 97 && keyCharCode <= 123) {
                    keyCharCode = keyValue.toUpperCase().charCodeAt(0);
                } else if (charCode_to_keyCode_map[keyCharCode]) {
                    keyCharCode = charCode_to_keyCode_map[keyCharCode];
                }

                keyEvent = document.createEvent("Events");
                keyEvent.initEvent(type, true, true);
                keyEvent.keyCode = keyCharCode;
                element.dispatchEvent(keyEvent);
            }

            for (var i = 0; i < inputValue.length; i++) {
                fireKeyEvent("keydown", inputValue[i]);
                element.value += inputValue[i];
                fireKeyEvent("keyup", inputValue[i]);
            }

            var response = JSON.stringify({
                name: 'sendKeysToElement',
                status: 0,
                value: ""
            });

            return response;
        }
    };

})();
