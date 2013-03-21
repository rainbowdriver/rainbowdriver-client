var rainbowDriver = rainbowDriver || {};

(function () {
    "use strict";

    rainbowDriver.commands = {
        executeScript: function executeScript(data) {
            try {
                var result = (new Function(data.script))();
                return {
                    command: 'executeScript',
                    status: 0,
                    value: result
                };
            } catch (e) {
                return {
                    command: 'executeScript',
                    status: 1,
                    value: "Error: " + e.message
                };
            }
        },

        findElement: function findElement(data) {
            var element = document.querySelector(data.selector);

            if (element) {
                return {
                    command: 'findElement',
                    elementId: new Date().getTime(),
                    selector: data.selector,
                    status: 0
                };
            } else {
                return {
                    command: 'findElement',
                    status: 7,
                    selector: data.selector
                };
            }
        },

        isElementDisplayed: function isElementDisplayed(data) {
            var element = document.querySelector(data.selector);
            if (!element) {
                return {
                    command: "clickElement",
                    status: 7,
                    statusText: "NoSuchElement"
                };
            }
            return {
                command: 'isElementDisplayed',
                status: 0,
                value: element.offsetHeight > 0
            };
        },

        getElementAttribute: function findElement(data) {
            var element = document.querySelector(data.selector);

            if (!element) {
                return {
                    command: 'getElementAttribute',
                    error: 'element not found'
                };
            }
            else {
                var response = {
                    command: 'getElementAttribute',
                    value: element.getAttribute(data.attribute)
                };
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

            if (!element || !rect || typeof rect.left === "undefined") {
                return {
                    command: "clickElement",
                    status: 7,
                    statusText: "NoSuchElement"
                };
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

            return {
                command: "clickElement",
                statusText: "OK",
                status: 0
            };
        },

        getTitle: function getTitle(data) {
            var response = {
                command: 'getTitle',
                value: document.title
            };

            return response;
        },

        getValue: function getValue(data) {
            var element = document.querySelector(data.selector);

            if (!element) {
                return false;
            }

            var response = {
                command: 'getElementText',
                value: element.textContent
            };

            return response;
        },

        getName: function getName(data) {
            var element = document.querySelector(data.selector);

            var response = {
                name: 'getElementTagName',
                value: false
            };

            if (!element) {
                return response;
            }

            response.value = element.tagName;
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


            var response = {
                command: 'clear',
            };

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

            return {
                command: 'getSelected',
                status: 0,
                value: selected
            };
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

            var response = {
                command: 'sendKeysToElement',
                status: 0,
                value: ""
            };

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
