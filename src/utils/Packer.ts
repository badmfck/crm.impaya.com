import crypto from "crypto"

/*var crypto = require('crypto');
const hash = crypto.createHash('sha256').update(input).digest('base64');
hex:

var crypto = require('crypto')
const hash = crypto.createHash('sha256').update(input).digest('hex');
*/
class Packer {
    
    
    //TODO: optimize to streams and bytes
    static baseMatrix:string[]=[ 
        'qIWDHpg9FCzUAQNJ',
        '8XfML0yORZeY5B4P',
        'T7a!nmkjGE1bv6dx',
        'oh3lrS_2tVwiscKu'
    ]

    private te:TextEncoder;
    private td:TextDecoder;
    constructor(){
        this.te=new TextEncoder();
        this.td=new TextDecoder();
    }

    pack(key:string,text:string):string{
        // FORM MATRIX
        let base="";
        const matrix = [...Packer.baseMatrix];
        let navigator:string="";
        let protector=256;
        while(matrix.length!==0){
            let index = Math.round(Math.random()*matrix.length);
            if(index===matrix.length)
                index--;
            if(index<0)
                index=0;
            base+=matrix[index];
            
            let charIndex = Math.round(Math.random()*matrix[index].length)
            if(charIndex===matrix[index].length)
                charIndex--;
            if(charIndex<0)
                charIndex=0;
            navigator+=matrix[index].charAt(charIndex)

            matrix.splice(index,1);

            if(protector--===0){
                console.error("Cant create base! while loop infinite error")
                return text;
            }
        }
        const te=new TextEncoder();

        const textBytes = te.encode(text);
        const baseBytes = te.encode(base);
        
        let keyHash = crypto.createHash("sha256").update(key).digest("base64");
        keyHash+=crypto.createHash("sha256").update(keyHash).digest("base64");
        keyHash = keyHash.substring(0,base.length)

        const keyBytes = te.encode(keyHash);

        let pos=0;
        let packed=[];
        for(let i of textBytes){
            const bbyte = baseBytes[pos];
            const kbyte = keyBytes[pos];
            pos++;
            if(pos === baseBytes.length)
                pos=0;
            let offset = Math.abs(kbyte-bbyte)
            if(offset === 0)
                offset = 128
            const b=i+offset
            if(b>255){
                packed.push(0)
                const p1=b-255;
                packed.push(p1)
                continue;
            }
            packed.push(b);
        }
        const result = new Uint8Array(packed).buffer;
        return navigator+Buffer.from(result).toString("base64");
    }

    unpack(key:string,text:string):string|null{
        try{
            const keyBytes=this.createKeyBytes(key)
            const navigator = text.substring(0,Packer.baseMatrix.length);
            //restore base!
            let base='';
            for(let i=0;i<navigator.length;i++){
                const navChar=navigator.charAt(i);
                for(let j=0;j<Packer.baseMatrix.length;j++){
                    if(Packer.baseMatrix[j].indexOf(navChar)!==-1)
                        base+=Packer.baseMatrix[j]
                }
            }
            const baseBytes = this.te.encode(base);
            
            text = text.substring(navigator.length)
            const buff=Buffer.from(text,"base64");
            const bytes = new Uint8Array(buff);
            
            const unpacked=[];
            let pos=0;
            let nextval=false;
            for(let i of bytes){
                const bbyte = baseBytes[pos];
                const kbyte = keyBytes[pos];
                let offset = Math.abs(kbyte - bbyte)
                if(offset===0)
                    offset = 128

                if(i===0){
                    nextval=true;
                    continue;
                }
                if(nextval){
                    nextval=false;
                    i+=255;
                }

                unpacked.push(i-offset);

                pos++;
                if(pos === baseBytes.length)
                    pos=0;
            }

            return this.td.decode(new Uint8Array(unpacked).buffer);
        }catch(e){
            return null;
        }
    }

    createKeyBytes(key:string){
        let keyHash = crypto.createHash("sha256").update(key).digest("base64");
        keyHash+=crypto.createHash("sha256").update(keyHash).digest("base64");
        keyHash = keyHash.substring(0,Packer.baseMatrix.length*Packer.baseMatrix[0].length)
        return this.te.encode(keyHash);
    }

}
export default Packer;