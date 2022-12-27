"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormInputSeparator = exports.FormInputCheckBox = exports.FormInput = void 0;
const react_1 = __importStar(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const Loader_1 = __importDefault(require("../ui/Loader"));
const FormEl = styled_components_1.default.form `
    display:flex;
    flex-direction:column;
    gap:1em;
    position: relative;
`;
const FormInputDiv = styled_components_1.default.div `
    display:flex;
    flex-direction:column;
    gap:4px;
    &>input{
        padding:0.6em;
        border-radius:4px;
        border:1px solid rgba(0,0,0,.2);
        outline:none;
    }
    &>input:focus{
        border:1px solid rgba(0,0,0,.6);
    }
    &>input[type=submit] {
        padding:10px;
        background-color:${({ theme }) => theme.buttonPrimaryBgColor};
        border-radius:6px;
        text-align: center;
        cursor: pointer;
        color:#FFFFFF;
        font-weight: bold;
        font-size:0.9em;
        user-select:none;
        transition: background-color .2s;
    }
    &>input[type=submit]:hover {
        background-color:${({ theme }) => theme.buttonPrimaryBgColorHover};
    }
    
     &>div{
        font-size:0.8em;
        color:rgba(0,0,0,.6);
     }
`;
const FormCheckboxDiv = styled_components_1.default.div `
    &>div:nth-child(1){
        font-size:0.8em;
        color:rgba(0,0,0,.6);
        flex-grow:1;
     }
     &[data-selected="true"]>div:nth-child(1){
        color:${({ theme }) => theme.primaryTextColor};
     }
    display:flex;
    gap:1em;
`;
const FormCheckboxElementDiv = styled_components_1.default.div `
    border:1px solid rgba(0,0,0,.2);
    width:1.5em;
    height:1em;
    min-width:1.5em;
    max-width:1.5em;
    max-height:1em;
    min-height:1em;
    border-radius:4px;
    overflow: hidden;
    padding:1px;
    cursor:pointer;
    
    &::after{
        height:100%;
        width:60%;
        background-color:${({ theme }) => theme.buttonPrimaryBgColor};
        display:block;
        border-radius:3px;
        transition: transform .15s, background-color .2s ;
        content:"";
    }

    &[data-selected="true"]{
        border:1px solid rgba(0,0,0,.6);
    }

    &[data-selected="true"]::after{
        border-radius:3px;
        transform:translateX(calc(60% + 1px));
        background-color:#2196f3;
    }

    &[data-selected="true"]:hover::after{
        background-color:#2990e4;
    }
    
    transition: background-color .2s;
    &:hover::after{
        background-color:${({ theme }) => theme.buttonPrimaryBgColorHover};
    }
`;
const FormInputSeparatorDiv = styled_components_1.default.div `
    height:1.5em;
`;
const LoaderBoxDiv = styled_components_1.default.div `
    position: absolute;
    top:0;
    left:0;
    background-color: rgba(255,255,255,.6);
    width:100%;
    height:100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;
const FormInput = (params) => {
    const { field, onChange } = params;
    const value = `${field.value}`;
    const onInputChange = (e) => {
        field.value = e.currentTarget.value;
        if (onChange)
            onChange(field);
    };
    return <FormInputDiv>{field.title && <div>{field.title}</div>}<input type={field.type} value={value} onChange={onChange && onInputChange}/></FormInputDiv>;
};
exports.FormInput = FormInput;
const FormInputCheckBox = (params) => {
    const { field, onChange } = params;
    const selected = field.value;
    const onItemClick = () => {
        if (onChange) {
            field.value = !selected;
            onChange(field);
        }
    };
    return <FormCheckboxDiv data-selected={selected}><div>{field.title}</div><FormCheckboxElementDiv onClick={onItemClick} data-selected={selected}/></FormCheckboxDiv>;
};
exports.FormInputCheckBox = FormInputCheckBox;
const FormInputSeparator = () => {
    return <FormInputSeparatorDiv />;
};
exports.FormInputSeparator = FormInputSeparator;
const Form = (params) => {
    const { fields, onSubmit, submitting } = params;
    const [formFields, setFormFields] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        setFormFields(fields);
    }, [fields]);
    const onFieldChange = (data) => {
        setFormFields([...fields]);
    };
    let key = 0;
    const f = formFields.map((val) => {
        switch (val.type) {
            case "checkbox":
                return <exports.FormInputCheckBox key={key++} field={val} onChange={onFieldChange}/>;
            case "separator":
                return <exports.FormInputSeparator key={key++}/>;
            default:
                return <exports.FormInput key={key++} field={val} onChange={onFieldChange}/>;
        }
    });
    const onFormSubmit = (e) => {
        e.preventDefault();
        if (onSubmit)
            onSubmit(formFields);
    };
    let loader = null;
    if (submitting) {
        loader = <LoaderBoxDiv>
            <Loader_1.default />
        </LoaderBoxDiv>;
    }
    return <FormEl onSubmit={onFormSubmit}>
        {f}
        {loader}
    </FormEl>;
};
exports.default = Form;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9hcGkvZm9ybS9Gb3JtLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUFtRDtBQUNuRCwwRUFBdUM7QUFDdkMsMERBQWtDO0FBRWxDLE1BQU0sTUFBTSxHQUFDLDJCQUFNLENBQUMsSUFBSSxDQUFBOzs7OztDQUt2QixDQUFBO0FBRUQsTUFBTSxZQUFZLEdBQUcsMkJBQU0sQ0FBQyxHQUFHLENBQUE7Ozs7Ozs7Ozs7Ozs7OzsyQkFlSixDQUFDLEVBQUMsS0FBSyxFQUFDLEVBQUMsRUFBRSxDQUFBLEtBQUssQ0FBQyxvQkFBb0I7Ozs7Ozs7Ozs7OzJCQVdyQyxDQUFDLEVBQUMsS0FBSyxFQUFDLEVBQUMsRUFBRSxDQUFBLEtBQUssQ0FBQyx5QkFBeUI7Ozs7Ozs7Q0FPcEUsQ0FBQTtBQUVELE1BQU0sZUFBZSxHQUFHLDJCQUFNLENBQUMsR0FBRyxDQUFBOzs7Ozs7O2dCQU9sQixDQUFDLEVBQUMsS0FBSyxFQUFDLEVBQUMsRUFBRSxDQUFBLEtBQUssQ0FBQyxnQkFBZ0I7Ozs7Q0FJaEQsQ0FBQTtBQUNELE1BQU0sc0JBQXNCLEdBQUcsMkJBQU0sQ0FBQyxHQUFHLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBZ0JkLENBQUMsRUFBQyxLQUFLLEVBQUMsRUFBQyxFQUFFLENBQUEsS0FBSyxDQUFDLG9CQUFvQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBdUJyQyxDQUFDLEVBQUMsS0FBSyxFQUFDLEVBQUMsRUFBRSxDQUFBLEtBQUssQ0FBQyx5QkFBeUI7O0NBRXBFLENBQUE7QUFFRCxNQUFNLHFCQUFxQixHQUFHLDJCQUFNLENBQUMsR0FBRyxDQUFBOztDQUV2QyxDQUFBO0FBRUQsTUFBTSxZQUFZLEdBQUcsMkJBQU0sQ0FBQyxHQUFHLENBQUE7Ozs7Ozs7Ozs7Q0FVOUIsQ0FBQTtBQUdN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