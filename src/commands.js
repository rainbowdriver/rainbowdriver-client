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
                button = data.button || 0,
                xoffset = data.xoffset || 0,
                yoffset = data.yoffset || 0,
                eventType = button === 2 ? 'contextmenu':'click',
                event;

            if (!element) {
                return false;
            }
            try {
                element.focus();
            } catch (e) { }

            event = document.createEvent('MouseEvents');
            event.initMouseEvent(eventType, true, false, window, 1,
                ((rect.left + element.clientWidth / 2) + xoffset),
                ((rect.top + element.clientHeight / 2) + yoffset),
                ((rect.left + element.clientWidth / 2) + xoffset),
                ((rect.top + element.clientHeight / 2) + yoffset),
                false, false, false, false, /* keys */
                button, /* button */
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

        clear: function clear(data) {
            var element = document.querySelector(data.selector);

            if (!element) {
                return false;
            }

            fireKeyEvent(element, "keydown", String.fromCharCode('57367'));
            element.value = "";
            fireKeyEvent(element, "keyup", String.fromCharCode('57367'));
                

            var response = JSON.stringify({
                name: 'clear',
            });

            return response;
        },

        getSelected: function getSelected(data) {
            var selected,
                element = document.querySelector(data.selector);

            if (!element) {
                return false;
            }

            if (element.tagName === 'INPUT' && element.type === 'checkbox') {
                selected = element.checked;
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


            for (var i = 0; i < inputValue.length; i++) {
                fireKeyEvent(element, "keydown", inputValue[i]);
                element.value += inputValue[i];
                fireKeyEvent(element, "keyup", inputValue[i]);
            }

            var response = JSON.stringify({
                name: 'sendKeysToElement',
                status: 0,
                value: ""
            });

            return response;
        }
    };

    function fireKeyEvent(element, type, keyValue) {
        var keyEvent,
            keyCharCode = keyValue.charCodeAt(0),
            charCode_to_keyCode_map;

       /* Map of ASCII code to javascript event key code
         * @key ASCII code generated by automation framework (keyboard simulation)
         * @value Javascript event code
         * Only works if event keycodes are used in javascript for key navigation
         * TODO: Add more generic behavior to the key codes
         */

        charCode_to_keyCode_map = {
            '57347' : 8, //backspace
            '57362': 37, //Left arrow
            '57364': 39, //right arrow
            '57351': 13, //Enter
            '57367': 46, //Delete
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

})();
