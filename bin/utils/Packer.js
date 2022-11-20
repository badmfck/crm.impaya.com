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
    epoch = 1668639144200;
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
    generateUID() {
        const id = Math.abs(+new Date() - this.epoch);
        return this.pack("internal", id.toString(16)).replaceAll("=", "");
    }
    passhash(passwd) {
        return crypto_1.default.createHash("sha256").update(passwd).digest("base64").replaceAll("=", "");
    }
}
exports.default = Packer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1BhY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG9EQUEyQjtBQVMzQixNQUFNLE1BQU07SUFJUixNQUFNLENBQUMsVUFBVSxHQUFVO1FBQ3ZCLGtCQUFrQjtRQUNsQixrQkFBa0I7UUFDbEIsa0JBQWtCO1FBQ2xCLGtCQUFrQjtLQUNyQixDQUFBO0lBRU8sRUFBRSxDQUFhO0lBQ2YsRUFBRSxDQUFhO0lBQ2YsS0FBSyxHQUFRLGFBQWEsQ0FBQztJQUNuQztRQUNJLElBQUksQ0FBQyxFQUFFLEdBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsRUFBRSxHQUFDLElBQUksV0FBVyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVELElBQUksQ0FBQyxHQUFVLEVBQUMsSUFBVztRQUV2QixJQUFJLElBQUksR0FBQyxFQUFFLENBQUM7UUFDWixNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksU0FBUyxHQUFRLEVBQUUsQ0FBQztRQUN4QixJQUFJLFNBQVMsR0FBQyxHQUFHLENBQUM7UUFDbEIsT0FBTSxNQUFNLENBQUMsTUFBTSxLQUFHLENBQUMsRUFBQztZQUNwQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEQsSUFBRyxLQUFLLEtBQUcsTUFBTSxDQUFDLE1BQU07Z0JBQ3BCLEtBQUssRUFBRSxDQUFDO1lBQ1osSUFBRyxLQUFLLEdBQUMsQ0FBQztnQkFDTixLQUFLLEdBQUMsQ0FBQyxDQUFDO1lBQ1osSUFBSSxJQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVwQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUks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LENBQUMsTUFBTSxHQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDbkYsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsV0FBVztRQUNQLE1BQU0sRUFBRSxHQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ25FLENBQUM7SUFFRCxRQUFRLENBQUMsTUFBYTtRQUNsQixPQUFPLGdCQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBQyxFQUFFLENBQUMsQ0FBQztJQUMxRixDQUFDOztBQUdMLGtCQUFlLE1BQU0sQ0FBQyJ9