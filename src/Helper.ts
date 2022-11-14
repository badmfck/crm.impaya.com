import Packer from "./utils/Packer";

const packer = new Packer();
class Helper{
    static pack = packer.pack.bind(packer);
    static unpack = packer.unpack.bind(packer); 
}

export default Helper;