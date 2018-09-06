
/**
Classes
*/
class ValidationResult {
    constructor() {
        this.result = true;
        this.reasons = new Array();
    }
}

class ValueRange {
    constructor() {
        this.isIncLower = false;
        this.isIncUpper = false;
        this.lowerBound = undefined;
        this.upperBound = undefined;
    }
}


/**
Library
*/
var DSPA = new function () {
    /*
    Constants
    */
    this.DATA_TYPE = {
        'INT':'int',
        'FLOAT':'float',
        'STRING':'string',
        'ARRAY':'array',
        'JSON':'json'
    };

    this.SPEC_KEY = {
        'TYPE': '__type__',
        'CHILDREN':'__children__',
        'LENGTH':'__length__',
        'RANGE':'__range__'
    };

    /**
    Type-check utils
    */
    this.isUndefined = function (x) {
        return (typeof x === 'undefined');
    };

    this.isInt = function (n) {
        return (!this.isUndefined(n)) && (Number(n) === n && n % 1 === 0);
    };

    this.isFloat = function (n) {
        return (!this.isUndefined(n)) && (Number(n) === n && n % 1 !== 0);
    };

    this.isString = function (s) {
        return (!this.isUndefined(s)) && (typeof s === 'string') || (s instanceof String);
    };

    this.isArray = function (a) {
        return (!this.isUndefined(a)) && (typeof a === 'object') && (a.constructor === Array);
    };

    this.isJson = function (obj) {
        return (!this.isUndefined(obj)) && (typeof obj === 'object') && (obj.constructor === Object);
    };

    this.isFunction = function (f) {
        return (!this.isUndefined(f)) && (typeof f === 'function');
    };

    this.isKey = function (k) {
        if (!this.isString(k)) {
            return false;
        }
        if (k.find(' ') >= 0) {
            return false;
        }
        if (k.find('.') >= 0) {
            return false;
        }
        return true;
    };

    this.isKeyword = function (k) {
        return false;
    };

    this.isSpec = function (spec) {
        if (!this.isJson(spec)) {
            return false;
        }
        return true;
    };

    this.isValueRange = function (r) {
        return (!this.isUndefined(r)) && (typeof r === 'object') && (r.constructor === ValueRange);
    };

    this.isValidationResult = function (r) {
        return (!this.isUndefined(r) && (typeof r === 'object') && (r.constructor === ValidationResult));
    };

    /**
    Parsing utils
    */
    this.parseValueRange = function (s) {
        let valueRange = new ValueRange();

        if (this.isInt(s) || this.isFloat(s)) {
            valueRange.isIncLower = true;
            valueRange.isIncUpper = true;
            valueRange.lowerBound = s;
            valueRange.upperBound = s;
        }
        else if (this.isString(s)) {
            s = s.trim();
            if (s.length > 0) {
                let firstChar = s.substring(0, 1);
                let lastChar = s.substring(s.length-1, s.length);
                if ((firstChar === '(' || firstChar === '[') && (lastChar === ')' || lastChar === ']')) { // a range string
                    let twoValueString = s.substring(1, s.length-1);
                    if (twoValueString.length > 3) {
                        let valueStrings = twoValueString.split(',');
                        if (valueStrings.length == 2) {
                            try {
                                let vlb = parseFloat(valueStrings[0]);
                                let vub = parseFloat(valueStrings[1]);
                                if (vlb > vub) {
                                    throw new Error("Invalid value string");
                                }
                                valueRange.isIncLower = (firstChar === '[');
                                valueRange.isIncUpper = (lastChar === ']');
                                valueRange.lowerBound = vlb;
                                valueRange.upperBound = vub;
                            } catch (ex) {
                                throw new Error("Invalid value string");
                            }
                        }
                        else {
                            throw new Error("Invalid value string");
                        }
                    }
                    else {
                        throw new Error("Invalid value string");
                    }
                }
                else { // a value string
                    try {
                        let fvalue = parseFloat(s);
                        return this.parseValueRange(fvalue);
                    } catch (ex) {
                        throw new Error("Invalid value string");
                    }
                }
            }
            else {
                throw new Error("Cannot parse a value range from an empty string");
            }
        }
        else {
            throw new Error("Unsupported type for s");
        }

        return valueRange;
    };

    /**
    IO utils
    */
    this.accessValue = function (jsonObj, vpath) {
        if (!this.isJson(jsonObj)) {
            throw new Error("jsonObj is not a Json object");
        }
        if (!this.isString(vpath)) {
            throw new Error("vpath is not a string");
        }

        let currObj = jsonObj;
        let keys = vpath.split('.');
        let i = 0;
        for (i = 0 ; i < keys.length ; i++) {
            if (this.isJson(currObj)) {
                if (currObj.hasOwnProperty(keys[i])) {
                    currObj = currObj[keys[i]];
                }
                else {
                    return undefined;
                }
            }
            else {
                return undefined;
            }
        }

        return currObj;
    };

    this.printJson = function (jsonObj, lenIndent) {
        if (!this.isJson(jsonObj)) {
            throw new Error("jsonObj is not a Json object");
        }
        if (!this.isInt(lenIndent)) {
            throw new Error("lenIndent is not an integer");
        }
        return JSON.stringify(jsonObj, undefined, lenIndent);
    };

    /**
    Validation utils
    */
    this.validateType = function (value, type) {
        if (!this.isString(type)) {
            throw new Error("type is not a string");
        }

        if (type === this.DATA_TYPE.STRING) {
            return this.isString(value);
        }
        if (type === this.DATA_TYPE.INT) {
            return this.isInt(value);
        }
        if (type === this.DATA_TYPE.FLOAT) {
            return this.isFloat(value);
        }
        if (type === this.DATA_TYPE.ARRAY) {
            return this.isArray(value);
        }
        if (type === this.DATA_TYPE.JSON) {
            return this.isJson(value);
        }

        throw new Error("unknown type: " + type);
    };

    this.validateValueRange = function(value, valueRange) {
        if (!this.isValueRange(valueRange)) {
            throw new Error("valueRange is not a ValueRange");
        }

        if (valueRange.isIncLower && value == valueRange.lowerBound) {
            return true;
        }
        if (valueRange.isIncUpper && value == valueRange.upperBound) {
            return true;
        }

        return (valueRange.lowerBound < value && value < valueRange.upperBound);
    };

    this.addValidationFail = function(validationResult, reason) {
        if (!this.isValidationResult(validationResult)) {
            throw new Error("validationResult is not a ValidationResult");
        }
        if (!this.isString(reason)) {
            throw new Error("reason is not a string");
        }
        validationResult.result = false;
        validationResult.reasons.push(reason);
    };

    /**
    Validation procedures
    */
    this.validateDataWithSpec = function (data, spec) {
        if (!this.isSpec(spec)) {
            throw new Error("spec is not a Spec");
        }

        // Report object
        let validationResult = new ValidationResult();

        // Check data type
        let dataType = undefined;
        if (spec.hasOwnProperty(this.SPEC_KEY.TYPE)) {
            dataType = spec[this.SPEC_KEY.TYPE];
            if (!this.validateType(data, dataType)) {
                this.addValidationFail(validationResult, "The data is not type " + dataType);
            }
        }
        else {
            this.addValidationFail(validationResult, "No data type specified in the Spec");
        }
        if (!validationResult.result) {
            return validationResult;
        }

        // Different validation processes based on the data type
        if (dataType === this.DATA_TYPE.JSON) {
            // Check the children
            if (spec.hasOwnProperty(this.SPEC_KEY.CHILDREN)) {
                // Check the unknown children in the data
                let childrenSpecs = spec[this.SPEC_KEY.CHILDREN];
                let dataChildrenKeys = Object.getOwnPropertyNames(data);
                let i = 0;
                for (i = 0 ; i < dataChildrenKeys.length ; i++) {
                    if (!childrenSpecs.hasOwnProperty(dataChildrenKeys[i])) {
                        this.addValidationFail(validationResult, "Unknown key " + dataChildrenKeys[i]);
                    }
                }

                // Validate the children
                let specChildrenKeys = Object.getOwnPropertyNames(childrenSpecs);
                for (i = 0 ; i < specChildrenKeys.length ; i++) {
                    let childKey = specChildrenKeys[i];
                    let childValidationResult = this.validateDataWithSpec(data[childKey], childrenSpecs[childKey]);
                    validationResult.result = (validationResult.result && childValidationResult.result);
                    validationResult.reasons = validationResult.reasons.concat(childValidationResult.reasons);
                }
            }
            else {
                throw new Error("Invalid Spec -- no " + this.SPEC_KEY.CHILDREN + " specified for Json spec");
            }
        }
        else if (dataType === this.DATA_TYPE.INT) {
            // Check range
            if (spec.hasOwnProperty(this.SPEC_KEY.RANGE)) {
                let valueRange = this.parseValueRange(spec[this.SPEC_KEY.RANGE]);
                if (!this.validateValueRange(data, valueRange)) {
                    this.addValidationFail(validationResult, "int out of range");
                }
            }
        }
        else if (dataType === this.DATA_TYPE.FLOAT) {
            // Check range
            if (spec.hasOwnProperty(this.SPEC_KEY.RANGE)) {
                let valueRange = this.parseValueRange(spec[this.SPEC_KEY.RANGE]);
                if (!this.validateValueRange(data, valueRange)) {
                    this.addValidationFail(validationResult, "float out of range");
                }
            }
        }
        else if (dataType === this.DATA_TYPE.ARRAY) {
        }
        else if (dataType ===  this.DATA_TYPE.STRING) {
            // Check range
            if (spec.hasOwnProperty(this.SPEC_KEY.LENGTH)) {
                let valueRange = this.parseValueRange(spec[this.SPEC_KEY.LENGTH]);
                if (!this.validateValueRange(data.length, valueRange)) {
                    this.addValidationFail(validationResult, "string-length out of range");
                }
            }
        }
        else {
            throw new Error("Uncaught dataType: " + dataType);
        }

        // Return
        return validationResult;
    };

};






