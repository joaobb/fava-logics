"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_uniqby_1 = __importDefault(require("lodash.uniqby"));
var automata_1 = require("../constants/automata");
var Automata = /** @class */ (function () {
    function Automata(states, alphabet, transitions, initialState, acceptanceStates) {
        this.states = states || [];
        this.alphabet = alphabet || [];
        this.initialState = initialState;
        this.acceptanceStates = acceptanceStates || [];
        this.transitions = transitions || [];
    }
    Automata.prototype.testWord = function (word) {
        var _this = this;
        var _a;
        var invalidSymbols = word
            .split("")
            .filter(function (symbol) { return !_this.alphabet.includes(symbol); });
        if (invalidSymbols.length)
            return {
                accepts: false,
                reason: "Unrecognized symbol(s) on word: ".concat(invalidSymbols.join(", ")),
                path: [],
            };
        if (!this.initialState)
            return { accepts: false, reason: "No initial state set", path: [] };
        if (!this.acceptanceStates.length)
            return { accepts: false, reason: "No acceptance states set", path: [] };
        var steps = this._walk(word);
        return {
            accepts: Boolean((_a = steps
                .at(-1)) === null || _a === void 0 ? void 0 : _a.transitions.some(function (step) {
                return _this.acceptanceStates.includes(step.target);
            })),
            path: steps,
        };
    };
    Object.defineProperty(Automata.prototype, "hasEpsilonTransitions", {
        get: function () {
            return this.alphabet.includes(automata_1.EPSILON_KEY);
        },
        enumerable: false,
        configurable: true
    });
    Automata.prototype._walk = function (word) {
        var _this = this;
        var firstStep = [
            { id: undefined, target: this.initialState },
        ];
        if (this.hasEpsilonTransitions) {
            firstStep.push.apply(firstStep, Automata.getEpsilonClosure(this.initialState, this.transitions));
        }
        return word.split("").reduce(function (path, symbol) {
            var _a;
            var lastStep = (_a = path.at(-1)) === null || _a === void 0 ? void 0 : _a.transitions;
            if (!lastStep)
                return path;
            var currentStep = [];
            lastStep.forEach(function (transition) {
                currentStep.push.apply(currentStep, Automata.step(transition.target, symbol, _this.transitions, _this.hasEpsilonTransitions));
            });
            return __spreadArray(__spreadArray([], path, true), [
                { key: symbol, transitions: (0, lodash_uniqby_1.default)(currentStep, "id") },
            ], false);
        }, [{ key: automata_1.EPSILON_KEY, transitions: firstStep }]);
    };
    Automata.step = function (stateId, symbol, transitions, hasEpsilonTransitions) {
        var target = transitions[stateId][symbol];
        if (target) {
            if (hasEpsilonTransitions) {
                var epsilonStep = Automata.handlePossibleEpsilonTransitions(target, transitions);
                if (epsilonStep.length) {
                    target.push.apply(target, epsilonStep);
                }
            }
        }
        return target || [];
    };
    Automata.handlePossibleEpsilonTransitions = function (currentTransitions, automataTransitions) {
        var statesWithEpsilonTransitions = currentTransitions.reduce(function (states, transition) {
            var _a;
            if ((_a = automataTransitions[transition.target]) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(automata_1.EPSILON_KEY))
                states.push(transition.target);
            return states;
        }, []);
        var epsilonClosure = [];
        if (statesWithEpsilonTransitions.length) {
            epsilonClosure.push.apply(epsilonClosure, Automata.getEpsilonClosure(statesWithEpsilonTransitions, automataTransitions));
        }
        return epsilonClosure;
    };
    Automata.getEpsilonClosure = function (states, transitions) {
        if (!Array.isArray(states))
            states = [states];
        return states
            .map(function (state) {
            var _a;
            var epsilonStep = (_a = transitions[state]) === null || _a === void 0 ? void 0 : _a[automata_1.EPSILON_KEY];
            if (!epsilonStep)
                return [];
            return __spreadArray(__spreadArray([], epsilonStep, true), Automata.getEpsilonClosure(epsilonStep.map(function (step) { return step.target; }), transitions), true);
        })
            .flat();
    };
    return Automata;
}());
exports.default = Automata;
