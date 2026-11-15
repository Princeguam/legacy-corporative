declare global {
    interface BigInt {
        toJSON(): number | string;
    }
}
BigInt.prototype.toJSON = function (): number | string {
    const value = this.valueOf();

    if (
        value <= BigInt(Number.MAX_SAFE_INTEGER) &&
        value >= BigInt(Number.MIN_SAFE_INTEGER)
    ) {
        return Number(value);
    }

    return value.toString();
};
