# Data Lab Report

  
  

## General Approach

  

- **Bitwise Operations Only**: Operations using XOR (^), AND (&), OR (|), NOT (~), left shift (<<), as well as right shift (>>).

- **Two's Complement Handling**: Negative numbers using two's complement (~x + 1), performing the operation, and converting back if necessary.

- **Loop-Based Algorithms**: multiplication and division use iterative bit manipulation.

- **No External Libraries**: Only with `<cstdint>` for `int32_t`.

  

## Function Implementations

  

### 1. Addition (`add`)

  

**Algorithm**: bitwise addition using the half-adder logic.

- While there is a carry, compute  sum without carry (XOR) and  carry (AND shifted left).

- This mimic digital circuit addition process.

  

**Code**:

```cpp

int32_t add(int32_t a, int32_t b) {

    while (b != 0) {

        int32_t carry = a & b;

        a = a ^ b;

        b = carry << 1;

    }

    return a;

}

```

  

### 2. Subtraction (`subtract`)

  

**Algorithm**: Subtraction as addition with  negated second operand.

- To compute `a - b`, use `a + (-b)`.

- `-b` in two's complement is `~b + 1`.

  

**Code**:

```cpp

int32_t subtract(int32_t a, int32_t b) {

    return add(a, add(~b, 1));

}

```

### 3. Multiplication (`multiply`)

  

**Algorithm**: Handle signs separately, then performs unsigned multiplication using bit shifting.

- Determine the sign of  result using XOR of input signs.

- Convert negative inputs to positive.

- loop: for each bit in `b`, if the bit is set, add the current `a` (shifted) to the result, then shift `a` left and `b` right.

  

**Code**:

```cpp

int32_t multiply(int32_t a, int32_t b) {

    int32_t result = 0;

    int32_t sign = ((a < 0) ^ (b < 0)) ? -1 : 1;

    a = (a < 0) ? add(~a, 1) : a;

    b = (b < 0) ? add(~b, 1) : b;

    while (b != 0) {

        if (b & 1) {

            result = add(result, a);

        }

        a <<= 1;

        b >>= 1;

    }

    return (sign < 0) ? add(~result, 1) : result;

}

```

  
  

### 4. Division (`divide`)

  

**Algorithm**: integer division using a bit-by-bit long division approach.

- Handle signs separately.

- Convert to positive values.

- Start from the most significant bit (31) down to 0.

- For each, check if subtracting `b << i` from the current `a` is possible; if so, set the quotient bit and update `a`.

  

**Code**:

```cpp

int32_t divide(int32_t a, int32_t b) {

    int32_t quotient = 0;

    int32_t sign = ((a < 0) ^ (b < 0)) ? -1 : 1;

    a = (a < 0) ? add(~a, 1) : a;

    b = (b < 0) ? add(~b, 1) : b;

    for (int i = 31; i >= 0; --i) {

        quotient <<= 1;

        if ((a >> i) >= b) {

            a = subtract(a, b << i);

            quotient |= 1;

        }

    }

    return (sign < 0) ? add(~quotient, 1) : quotient;

}

```

  
  

### 5. Modulo (`modulo`)

  

**Algorithm**: Modulo is computed as remainder after division.

- `a % b = a - (a / b) * b`.

  

**Code**:

```cpp

int32_t modulo(int32_t a, int32_t b) {

    int32_t quotient = divide(a, b);

    return subtract(a, multiply(quotient, b));

}

```

  
  

## Testing and Validation

  

The implementation was using ctest

- Basic operations

- Negative numbers

- Edge cases (zero, overflow/underflow)

- All functions passed the test suite.