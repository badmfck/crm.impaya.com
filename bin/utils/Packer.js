"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class Packer {
    static baseMatrix = [
        'qIWDHpg9FCzUAQNJ',
        '8XfML0yORZeY5B4P',
        'T7a!nmkjGE1bv6dx',
        'oh3lrS_2tVwiscKu'
    ];
    te;
    td;
    constructor() {
        this.te = new TextEncoder();
        this.td = new TextDecoder();
    }
    pack(key, text) {
        let base = "";
        const matrix = [...Packer.baseMatrix];
        let navigator = "";
        let protector = 256;
        while (matrix.length !== 0) {
            let index = Math.round(Math.random() * matrix.length);
            if (index === matrix.length)
                index--;
            if (index < 0)
                index = 0;
            base += matrix[index];
            let charIndex = Math.round(Math.random() * matrix[index].length);
            if (charIndex === matrix[index].length)
                charIndex--;
            if (charIndex < 0)
                charIndex = 0;
            navigator += matrix[index].charAt(charIndex);
            matrix.splice(index, 1);
            if (protector-- === 0) {
                console.error("Cant create base! while loop infinite error");
                return text;
            }
        }
        const te = new TextEncoder();
        const textBytes = te.encode(text);
        const baseBytes = te.encode(base);
        let keyHash = crypto_1.default.createHash("sha256").update(key).digest("base64");
        keyHash += crypto_1.default.createHash("sha256").update(keyHash).digest("base64");
        keyHash = keyHash.substring(0, base.length);
        const keyBytes = te.encode(keyHash);
        let pos = 0;
        let packed = [];
        for (let i of textBytes) {
            const bbyte = baseBytes[pos];
            const kbyte = keyBytes[pos];
            pos++;
            if (pos === baseBytes.length)
                pos = 0;
            let offset = Math.abs(kbyte - bbyte);
            if (offset === 0)
                offset = 128;
            const b = i + offset;
            if (b > 255) {
                packed.push(0);
                const p1 = b - 255;
                packed.push(p1);
                continue;
            }
            packed.push(b);
        }
        const result = new Uint8Array(packed).buffer;
        return navigator + Buffer.from(result).toString("base64");
    }
    unpack(key, text) {
        try {
            const keyBytes = this.createKeyBytes(key);
            const navigator = text.substring(0, Packer.baseMatrix.length);
            let base = '';
            for (let i = 0; i < navigator.length; i++) {
                const navChar = navigator.charAt(i);
                for (let j = 0; j < Packer.baseMatrix.length; j++) {
                    if (Packer.baseMatrix[j].indexOf(navChar) !== -1)
                        base += Packer.baseMatrix[j];
                }
            }
            const baseBytes = this.te.encode(base);
            text = text.substring(navigator.length);
            const buff = Buffer.from(text, "base64");
            const bytes = new Uint8Array(buff);
            const unpacked = [];
            let pos = 0;
            let nextval = false;
            for (let i of bytes) {
                const bbyte = baseBytes[pos];
                const kbyte = keyBytes[pos];
                let offset = Math.abs(kbyte - bbyte);
                if (offset === 0)
                    offset = 128;
                if (i === 0) {
                    nextval = true;
                    continue;
                }
                if (nextval) {
                    nextval = false;
                    i += 255;
                }
                unpacked.push(i - offset);
                pos++;
                if (pos === baseBytes.length)
                    pos = 0;
            }
            return this.td.decode(new Uint8Array(unpacked).buffer);
        }
        catch (e) {
            return null;
        }
    }
    createKeyBytes(key) {
        let keyHash = crypto_1.default.createHash("sha256").update(key).digest("base64");
        keyHash += crypto_1.default.createHash("sha256").update(keyHash).digest("base64");
        keyHash = keyHash.substring(0, Packer.baseMatrix.length * Packer.baseMatrix[0].length);
        return this.te.encode(keyHash);
    }
}
exports.default = Packer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1BhY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG9EQUEyQjtBQVMzQixNQUFNLE1BQU07SUFJUixNQUFNLENBQUMsVUFBVSxHQUFVO1FBQ3ZCLGtCQUFrQjtRQUNsQixrQkFBa0I7UUFDbEIsa0JBQWtCO1FBQ2xCLGtCQUFrQjtLQUNyQixDQUFBO0lBRU8sRUFBRSxDQUFhO0lBQ2YsRUFBRSxDQUFhO0lBQ3ZCO1FBQ0ksSUFBSSxDQUFDLEVBQUUsR0FBQyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxFQUFFLEdBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQsSUFBSSxDQUFDLEdBQVUsRUFBQyxJQUFXO1FBRXZCLElBQUksSUFBSSxHQUFDLEVBQUUsQ0FBQztRQUNaLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsSUFBSSxTQUFTLEdBQVEsRUFBRSxDQUFDO1FBQ3hCLElBQUksU0FBUyxHQUFDLEdBQUcsQ0FBQztRQUNsQixPQUFNLE1BQU0sQ0FBQyxNQUFNLEtBQUcsQ0FBQyxFQUFDO1lBQ3BCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxJQUFHLEtBQUssS0FBRyxNQUFNLENBQUMsTUFBTTtnQkFDcEIsS0FBSyxFQUFFLENBQUM7WUFDWixJQUFHLEtBQUssR0FBQyxDQUFDO2dCQUNOLEtBQUssR0FBQyxDQUFDLENBQUM7WUFDWixJQUFJLElBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXBCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFDLE1BQU0s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