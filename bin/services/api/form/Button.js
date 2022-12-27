"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const styled_components_1 = __importDefault(require("styled-components"));
const ButtonDiv = styled_components_1.default.div `
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
    &:hover{
        background-color:${({ theme }) => theme.buttonPrimaryBgColorHover};
    }

`;
const Button = (params) => {
    const { secondary, title } = params;
    return <ButtonDiv>{title}</ButtonDiv>;
};
exports.default = Button;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnV0dG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FwaS9mb3JtL0J1dHRvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwwRUFBdUM7QUFFdkMsTUFBTSxTQUFTLEdBQUMsMkJBQU0sQ0FBQyxHQUFHLENBQUE7O3VCQUVILENBQUMsRUFBQyxLQUFLLEVBQUMsRUFBQyxFQUFFLENBQUEsS0FBSyxDQUFDLG9CQUFvQjs7Ozs7Ozs7OzsyQkFVakMsQ0FBQyxFQUFDLEtBQUssRUFBQyxFQUFDLEVBQUUsQ0FBQSxLQUFLLENBQUMseUJBQXlCOzs7Q0FHcEUsQ0FBQTtBQUNELE1BQU0sTUFBTSxHQUFHLENBQUMsTUFBeUQsRUFBQyxFQUFFO0lBQ3hFLE1BQU0sRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLEdBQUcsTUFBTSxDQUFDO0lBQ2pDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUN6QyxDQUFDLENBQUE7QUFFRCxrQkFBZSxNQUFNLENBQUMifQ==