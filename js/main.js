"use strict";

var clock = function () {
    var _hands = {
        hours: 0,
        minutes: 0,
        /**
         *
         * @param {number} hours
         */
        setHrs: function setHrs(hours) {
            this.hours = hours % 12;
        },

        /**
         *
         * @param {number} minutes
         */
        setMins: function setMins(minutes) {
            this.minutes = minutes % 60;
        },

        /**
         *
         * @returns {number}
         */
        getHoursHandAngle: function getHoursHandAngle() {
            return this.hours * 30 + this.minutes * 0.5;
        },

        /**
         *
         * @returns {number}
         */
        getMinutesHandAngle: function getMinutesHandAngle() {
            return this.minutes * 6;
        }
    };

    return {
        /**
         *
         * @param {Date} date
         * @returns {{}}
         */
        init: function init(date) {
            _hands.setHrs(date.getHours());
            _hands.setMins(date.getMinutes());
            return this;
        },

        /**
         *
         * @returns {{degrees: *,
                      minutesHandAngle: *,
                      hoursHandAngle: *,
                      startArc: *,
                      stopArc: *,
                      innerAngle: *,
                      outerAngle: *,}}
         */
        getHands: function getHands() {

            var hoursHandAngle = _hands.getHoursHandAngle();
            var minutesHandAngle = _hands.getMinutesHandAngle();
            var degrees = hoursHandAngle - minutesHandAngle;
            var absDegrees = Math.abs(degrees);
            var startArc = 0;
            var stopArc = 0;
            var innerAngle = 0;
            var outerAngle = 0;

            if (degrees <= 180 && degrees > 0) {
                startArc = minutesHandAngle;
                stopArc = hoursHandAngle;
            }
            if (degrees < 0 || degrees > 180) {
                startArc = hoursHandAngle;
                stopArc = minutesHandAngle;
            }
            if (degrees < 0 && absDegrees > 180) {
                startArc = minutesHandAngle;
                stopArc = hoursHandAngle;
            }

            if (absDegrees > 180) {
                innerAngle = 360 - absDegrees;
                outerAngle = absDegrees;
            } else {
                innerAngle = absDegrees;
                outerAngle = 360 - absDegrees;
            }

            return {
                degrees: degrees,
                minutesHandAngle: minutesHandAngle,
                hoursHandAngle: hoursHandAngle,
                startArc: startArc,
                stopArc: stopArc,
                innerAngle: innerAngle,
                outerAngle: outerAngle
            };
        }
    };
}();

var sector = function () {
    /**
     *
     * @param {number} centerX
     * @param {number} centerY
     * @param {number} radius
     * @param {number} angleInDegrees
     * @returns {{x: *, y: *}}
     */
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians)
        };
    }

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {number} startAngle
     * @param {number} endAngle
     * @returns {string}
     */
    function calculateArc(x, y, radius, startAngle, endAngle) {
        var start = polarToCartesian(x, y, radius, endAngle),
            end = polarToCartesian(x, y, radius, startAngle),
            arcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return ["M", x, y, "L", start.x, start.y, "A", radius, radius, 0, arcFlag, 0, end.x, end.y, "z"].join(" ");
    }

    return {
        getSectorPath: calculateArc
    };
}();

var clockSvg = function () {
    var svgDoc = null,
        innerIconPie = null,
        outerIconPie = null,
        innerValue = null,
        outerValue = null,
        innerAngleValue = null,
        outerAngleValue = null,
        innerSector = null,
        outerSector = null,
        innerPanel = null,
        outerPanel = null,
        minutesHand = null,
        hoursHand = null;

    function setUp(svg) {
        svgDoc = svg;
        innerIconPie = svgDoc.getElementById("icon-pie-inner");
        outerIconPie = svgDoc.getElementById("icon-pie-outer");
        innerValue = svgDoc.getElementById("inner-value");
        outerValue = svgDoc.getElementById("outer-value");
        innerAngleValue = svgDoc.getElementById("inner-angle-value");
        outerAngleValue = svgDoc.getElementById("outer-angle-value");
        innerSector = svgDoc.getElementById("inner-sector");
        outerSector = svgDoc.getElementById("outer-sector");
        minutesHand = svgDoc.getElementById("minutes-hand");
        hoursHand = svgDoc.getElementById("hours-hand");
        innerPanel = svgDoc.getElementById("inner-panel");
        outerPanel = svgDoc.getElementById("outer-panel");
        return this;
    }

    function animate() {
        // Ugly hardcoded style attributes
        function setInnerAnimatedState() {
            innerSector.setAttribute("style", "fill:#FFBBBB");
            innerValue.setAttribute("style", "fill:#990000;");
            innerIconPie.setAttribute("style", "fill:#990000;");
        }

        function setInnerPreviousState() {
            innerSector.removeAttribute("style");
            innerValue.removeAttribute("style");
            innerIconPie.removeAttribute("style");
        }

        function setOuterAnimatedState() {
            outerSector.setAttribute("style", "fill:#bbffff");
            outerValue.setAttribute("style", "fill:#009999;");
            outerIconPie.setAttribute("style", "fill:#009999;");
        }

        function setOuterPreviousState() {
            outerSector.removeAttribute("style");
            outerValue.removeAttribute("style");
            outerIconPie.removeAttribute("style");
        }

        innerPanel.addEventListener("mouseover", setInnerAnimatedState);
        innerPanel.addEventListener("mouseout", setInnerPreviousState);
        outerPanel.addEventListener("mouseover", setOuterAnimatedState);
        outerPanel.addEventListener("mouseout", setOuterPreviousState);
        innerSector.addEventListener("mouseover", setInnerAnimatedState);
        innerSector.addEventListener("mouseout", setInnerPreviousState);
        outerSector.addEventListener("mouseover", setOuterAnimatedState);
        outerSector.addEventListener("mouseout", setOuterPreviousState);
    }

    function play(hours, minutes) {
        var myDate = new Date();
        myDate.setHours(hours);
        myDate.setMinutes(minutes);
        var hands = clock.init(myDate).getHands();
        console.log(hands);

        //default color for innerSector is 'white'. This one placed over outerSector
        // outerSector change color on hover event
        var arc = sector.getSectorPath(300, 300, 300, hands.startArc, hands.stopArc);
        innerSector.setAttribute("d", arc);

        minutesHand.setAttribute("transform", "rotate(" + hands.minutesHandAngle + " 300 300)");
        hoursHand.setAttribute("transform", "rotate(" + hands.hoursHandAngle + " 300 300)");

        outerAngleValue.innerHTML = hands.outerAngle;
        innerAngleValue.innerHTML = hands.innerAngle;
        animate();
    }

    return {
        play: play,
        setUp: setUp
    };
}();

window.onload = function () {
    var object = document.getElementById("clock");
    var svgClock = void 0;
    try {
        svgClock = object.contentDocument;
    } catch (e) {
        try {
            svgClock = object.getSVGDocument();
        } catch (e) {
            alert("SVG in object not supported in your environment");
        }
    }
    var inputHours = document.getElementById("hour");
    var inputMinutes = document.getElementById("minute");
    var inputForm = document.getElementById("input-time");
    clockSvg.setUp(svgClock).play(inputHours.value, inputMinutes.value);
    inputForm.oninput = function () {
        return clockSvg.play(inputHours.value, inputMinutes.value);
    };
};
