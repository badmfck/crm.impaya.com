import { DateFormatter } from "./utils/DateFormatter";
import Packer from "./utils/Packer";

const packer = new Packer();
class Helper{
    static pack = packer.pack.bind(packer);
    static unpack = packer.unpack.bind(packer); 
    static generateUID = packer.generateUID.bind(packer); 
    static passhash = packer.passhash.bind(packer); 
    static dateFormatter = new DateFormatter();
}

export default Helper;