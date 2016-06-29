/**
 * Wrap a buffer and provide some handy operations, and a cursor.
 */
export class BufferWrapper {
    buffer:Buffer;
    ptr: number;

    constructor(buf:Buffer) {
        this.buffer = buf;
        this.ptr = 0;
    }

    /**
     * Append the given bytes to our buffer.
     * @param buf
     */
    append(buf:Buffer) {
        buf.copy(this.buffer, this.ptr);
        this.ptr += buf.length;
    }

    /**
     * Read exactly the requested number of bytes from the buffer, or return null if there aren't
     * that many available. The read bytes are logically removed from the buffer.
     */
    readExactly(num:number) {
        if (num > this.ptr) {
            return null;
        }

        // Extract the required bytes.
        let ret:Buffer = new Buffer(num);
        this.buffer.copy(ret, 0, 0, num);

        // Remove these bytes from the buffer by moving everything else to the left.
        this.buffer.copy(this.buffer, 0, num, this.ptr);
        this.ptr -= num;

        return ret;
    }
}
