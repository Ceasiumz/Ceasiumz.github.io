
---
## **PART 1: RISC-V CALLING CONVENTION & ASSEMBLY**

### **RISC-V Register Conventions**

- **x0**: Zero register (hardwired to 0)
- **x1 (ra)**: Return address
- **x2 (sp)**: Stack pointer
- **x5-x7, x28-x31**: Temporary registers (caller-saved, not preserved)
- **x8-x9, x18-x27**: Saved registers (callee-saved, must be preserved)
- **x10-x11 (a0-a1)**: Return values / First two arguments
- **x12-x17 (a2-a7)**: Additional function arguments

### **Function Call Protocol**

1. **Caller** puts arguments in a0-a7
2. Calls function with `jal x1, function_label`
3. **Callee** saves callee-saved registers if needed
4. Returns with `jalr x0, 0(x1)` (or `ret`)
5. **Caller** receives return value in a0-a1

### **Stack Frame Layout**

```
High Address
[Previous Frame]
[ra (return address)]      ← sp + offset
[s0-s11 (saved regs)]
[Local variables]
Low Address → [sp]
```

### **Common RISC-V Instructions**

- **Arithmetic**: `add`, `addi`, `sub`, `mul`, `div`
- **Logical**: `and`, `andi`, `or`, `ori`, `xor`, `xori`
- **Shift**: `sll`, `slli`, `srl`, `srli`, `sra`, `srai`
- **Load/Store**: `lw`, `sw`, `lh`, `sh`, `lb`, `sb`
- **Branch**: `beq`, `bne`, `blt`, `ble`, `bgt`, `bge`
- **Jump**: `jal`, `jalr`

---

## **PART 2: PROCESSOR & PIPELINE (Patterson-Hennessy Ch. 4)**

### **Datapath Components**

- **ALU**: Performs arithmetic/logic operations
- **Registers**: Hold operands and results
- **Memory**: Instruction and data memory
- **Control Unit**: Generates control signals

### **Five-Stage Pipeline**

1. **IF** (Instruction Fetch): Read instruction from memory
2. **ID** (Instruction Decode): Decode instruction, read registers
3. **EX** (Execute): Perform ALU operation
4. **MEM** (Memory): Access data memory
5. **WB** (Write Back): Write result to register

### **Pipeline Hazards & Solutions**

| Hazard Type        | Cause                                  | Solution                                               |
| ------------------ | -------------------------------------- | ------------------------------------------------------ |
| **Structural**     | Resource conflicts                     | Duplicate hardware or pipeline delay                   |
| **Data Hazard**    | Instruction depends on previous result | Forwarding, stall, or reordering                       |
| **Control Hazard** | Branch/jump delays                     | Branch prediction, delay slot, or branch target buffer |

**Forwarding (Bypassing)**: Pass result directly from earlier stage without writing to register file.

**Stall (Bubble)**: Insert NOP instruction to delay dependent instruction.

---

## **PART 3: MEMORY HIERARCHY (CSAPP Ch. 6.1-6.4)**

### **6.1 Storage Technologies**

#### **SRAM vs DRAM**

|Feature|SRAM|DRAM|
|---|---|---|
|**Transistors/bit**|6-8|1|
|**Access Time**|1-3 ns|50-70 ns|
|**Refresh Needed?**|No|Yes (10-100 ms)|
|**Cost**|~1000× more expensive|Baseline|
|**Use**|L1/L2/L3 Cache|Main Memory|

**DRAM Organization**: d × w (d supercells, w bits each)

- **RAS (Row Access Strobe)**: Select row
- **CAS (Column Access Strobe)**: Select column
- **Row Buffer**: Temporary storage during access

#### **Disk Storage**

**Access Time Components**:

- **Seek Time**: Head moves to correct track (~3-9 ms)
- **Rotational Latency**: Wait for sector (~2-4 ms at 7200 RPM)
- **Transfer Time**: Read/write data (~0.02 ms per sector)

**Total Average Access ≈ 13 ms** (1000× slower than DRAM!)

**Formula**:

```
T_access = T_seek + T_rotation + T_transfer
T_avg_rotation = 0.5 × (60 sec / RPM) × 1000 ms
```

#### **SSD (Solid State Disk)**

- Flash-based, no moving parts
- **Reads faster than writes**
- Block must be erased before page write
- **Wear leveling** to maximize lifetime

---

### **6.2 Locality**

#### **Principle of Locality**

Programs tend to reuse data/instructions from:

**Temporal Locality**: Same data accessed repeatedly

- Solution: Keep recently used data in fast cache

**Spatial Locality**: Nearby data accessed together

- Solution: Use cache blocks (lines)

#### **Stride-k Reference Pattern**

- **Stride-1**: Excellent spatial locality (sequential array access)
- **Stride-k (k>1)**: Decreasing spatial locality
- **High-order bit indexing**: Poor spatial locality (wastes cache)
- **Middle-bit indexing**: Better spatial locality

**Cache-Friendly Code Tips**:

1. Maximize temporal locality: Reuse data
2. Maximize spatial locality: Access arrays sequentially
3. Match loop structure to memory layout (row-major for 2D arrays)
4. Minimize cache line conflicts

---

### **6.3 Memory Hierarchy**

#### **Typical Levels**

```
L0: CPU Registers (0.3 ns, ~1 KB)
    ↓
L1: L1 Cache (SRAM, 4-5 cycles, 32 KB)
    ↓
L2: L2 Cache (SRAM, 10 cycles, 256 KB)
    ↓
L3: L3 Cache (SRAM, 50 cycles, 8 MB)
    ↓
L4: Main Memory (DRAM, 200 cycles, GB)
    ↓
L5: Local Disk (HDD/SSD, ms, TB)
```

#### **Caching Basics**

- **Cache Hit**: Data found in cache (fast access)
- **Cache Miss**: Data not in cache (stall, fetch from lower level)
- **Hit Time**: Cycles to return data on hit
- **Miss Penalty**: Additional cycles for miss
- **Hit Rate** = 1 - Miss Rate

#### **Block Replacement Policies**

- **Random**: Simple but suboptimal
- **LRU (Least Recently Used)**: Replace oldest accessed block
- **LFU (Least Frequently Used)**: Replace least accessed block
- **FIFO**: Replace oldest block

#### **Cache Miss Categories (4 C's)**

1. **Compulsory (Cold) Miss**: First reference to block
2. **Capacity Miss**: Working set too large for cache
3. **Conflict Miss**: Multiple blocks map to same cache set
4. **Coherency Miss**: Multiprocessor invalidations

---

### **6.4 Cache Memories**

#### **Cache Organization: (S, E, B, m)**

- **S = 2^s**: Number of sets
- **E**: Associativity (lines per set)
- **B = 2^b**: Block size (bytes)
- **m**: Address bits
- **C = S × E × B**: Cache capacity
- **t = m - (s + b)**: Tag bits

#### **Address Partition**

```
[Tag Bits (t)] [Set Index Bits (s)] [Block Offset Bits (b)]
```

#### **Direct-Mapped Cache (E=1)**

- **Set Selection**: Extract s bits → selects set
- **Line Matching**: Check valid bit + tag match
- **Word Extraction**: Use b bits to select byte in block
- **Conflict Misses**: Common when blocks map to same set
- **No choice in replacement**: Current line evicted

**Example Problem**:

- 16 KB cache, 64B blocks → 256 sets
- Tag bits = 32 - 6 - 8 = 18 bits

#### **Set-Associative Cache (1 < E < C/B)**

- Each set has E lines
- **Advantages**: Reduces conflict misses
- **Disadvantages**: More hardware, slower tag matching
- **Replacement Policy**: LRU typically used

**Common**: 2-way, 4-way, 8-way associative

#### **Fully Associative Cache (E = C/B)**

- One large set containing all lines
- **Advantages**: Minimizes conflict misses
- **Disadvantages**: Expensive (all tags must match in parallel)
- **Use**: Only for small caches (e.g., TLB)

---

### **6.4.5 Cache Write Strategies**

#### **Write Hit**

- **Write-Through**: Immediately write to next level
    
    - Pros: Simple, data always consistent
    - Cons: Bus traffic, slow
    - Uses write buffer to hide latency
- **Write-Back**: Defer write until eviction
    
    - Pros: Reduces traffic, faster
    - Cons: Complex, dirty bit needed
    - Data temporarily inconsistent

#### **Write Miss**

- **Write-Allocate**: Fetch block, then update
    
    - Typical for write-back caches
    - Exploits spatial locality
- **No-Write-Allocate**: Bypass cache, write directly to memory
    
    - Typical for write-through caches
    - Good for streaming writes

**Modern Default**: Write-back + Write-allocate

---

### **6.4.6 Real Cache Hierarchy Example: Intel Core i7**

|Level|Type|Size|Associativity|Block Size|Access Time|
|---|---|---|---|---|---|
|L1-I|I-Cache|32 KB|8-way|64 B|4 cycles|
|L1-D|D-Cache|32 KB|8-way|64 B|4 cycles|
|L2|Unified|256 KB|8-way|64 B|10 cycles|
|L3|Shared|8 MB|16-way|64 B|40-75 cycles|

---

### **6.4.7 Performance Metrics**

**AMAT** (Average Memory Access Time):

```
AMAT = Hit_Time + Miss_Rate × Miss_Penalty

For multi-level cache:
AMAT = L1_hit_time + L1_miss_rate × (L2_hit_time + L2_miss_rate × L2_miss_penalty)
```

**Effective CPI**:

```
CPI_eff = Base_CPI + (Instr_Miss_Rate × Instr_Miss_Penalty) 
                   + (Load_Store_Fraction × Data_Miss_Rate × Data_Miss_Penalty)
```

#### **Cache Design Trade-offs**

|Parameter|Larger|Smaller|
|---|---|---|
|**Cache Size**|↑ Hit rate|↓ Hit time|
|**Block Size**|↑ Spatial locality|↓ Temporal locality|
|**Associativity**|↓ Conflict misses|↑ Hit time|

---
## **QUICK FACTS TO MEMORIZE**
- **CPU-Memory Gap**: Growing ~50% per year (processor 60%/yr, DRAM 9%/yr)
- **Latency Hierarchy**: Register (0.3ns) → L1 (1-2ns) → L2 (3-5ns) → L3 (15ns) → DRAM (50-100ns) → Disk (10ms)
- **Memory Technologies**: SRAM (fast, expensive, dense) vs DRAM (slow, cheap, dense)
- **Cache Miss Cost**: ~20 cycles from L2, ~200 cycles from memory
- **Locality Matters**: Stride-1 access >> stride-k access; temporal > spatial in most codes

## **PART 4: SINGLE-CYCLE DATAPATH & CONTROL (Patterson-Hennessy Ch. 4)**

### **Control Signal Summary**

|Signal|Description|Values|
|---|---|---|
|**PCSrc**|Select PC source|0: PC+4 \| 1: Branch/JAL target|
|**RegWr (RegWrite)**|Enable register write|0: Store/Branch \| 1: All others|
|**MemRd (MemRead)**|Read from memory|0: No read \| 1: Load instruction|
|**MemWr (MemWrite)**|Write to memory|0: No write \| 1: Store instruction|
|**ALUSrc**|ALU input B source|0: rs2 (R-type) \| 1: Immediate (I-type)|
|**Asel**|ALU input A source|0: rs1 \| 1: PC (for JAL/JALR)|
|**Bsel**|ALU input B source (before mux)|0: rs2 \| 1: Immediate|
|**WBsel (MemtoReg)**|Write-back source|0: Memory (Load) \| 1: ALU result (R-type) \| 2: PC+4 (JAL/JALR)|
|**ALUOp**|ALU operation type|00: ADD \| 01: SUB \| 10: from funct3/funct7|
|**ImmSel**|Immediate format|I/S/B/U/J types|

### **High-Level Control Logic**

```
PCSrc    = (Branch AND BrEq) OR JAL OR JALR ? 1 : 0
RegWr    = NOT(Store OR Branch) ? 1 : 0
MemRd    = Load ? 1 : 0
MemWr    = Store ? 1 : 0
ALUSrc   = R-type ? 0 : 1
Asel     = (JAL OR JALR) ? 1 : 0
Bsel     = R-type ? 0 : 1
WBsel    = Load ? 0 : (R-type ? 1 : (JAL OR JALR ? 2 : X))
BrUn     = Unsigned branch (BLTU, BGEU) ? 1 : 0
BrLT     = BrEq=0 AND (rs1 < rs2 for BLT, etc.) ? 1 : 0
```

### **ALU Control Logic**

**ALU Operation Depends On**:

1. **ALUOp** (from main controller) - instruction type
2. **funct3** (bits 14-12) - operation subtype
3. **funct7[5]** (bit 30) - distinguishes ADD/SUB, SRL/SRA


---

## **PART 5: RISC-V INSTRUCTION FORMATS & ENCODING**

### **Six RISC-V Instruction Types**

**R-Type** (Register-Register Operations)

```
[funct7(7)] [rs2(5)] [rs1(5)] [funct3(3)] [rd(5)] [opcode(7)]
31-25         24-20    19-15    14-12       11-7    6-0
```

Examples: `add`, `sub`, `and`, `or`, `xor`, `sll`, `srl`, `sra`, `slt`

**I-Type** (Immediate & Load Operations)

```
[imm(12)] [rs1(5)] [funct3(3)] [rd(5)] [opcode(7)]
31-20      19-15     14-12       11-7    6-0
```

Examples: `addi`, `lw`, `lh`, `lb`, `slti`, `xori`, `ori`, `andi`

**S-Type** (Store Operations)

```
[imm[11:5](7)] [rs2(5)] [rs1(5)] [funct3(3)] [imm[4:0](5)] [opcode(7)]
31-25           24-20    19-15    14-12       11-7         6-0
```

Examples: `sw`, `sh`, `sb` Immediate = `imm[11:5] || imm[4:0]` (sign-extended)

**B-Type** (Branch Operations)

```
[imm[12|10:5](7)] [rs2(5)] [rs1(5)] [funct3(3)] [imm[4:1|11](5)] [opcode(7)]
31-25              24-20    19-15    14-12       11-7             6-0
```

Examples: `beq`, `bne`, `blt`, `bge`, `bltu`, `bgeu` Immediate = `imm[12] || imm[10:5] || imm[4:1] || imm[11] || 0` (branch offset × 2)

**U-Type** (Upper Immediate)

```
[imm[31:12](20)] [rd(5)] [opcode(7)]
31-12             11-7    6-0
```

Examples: `lui`, `auipc`

**J-Type** (Jump Operations)

```
[imm[20|10:1|11|19:12](20)] [rd(5)] [opcode(7)]
31-12                        11-7    6-0
```

Examples: `jal` Immediate = `imm[20] || imm[10:1] || imm[11] || imm[19:12] || 0` (jump offset × 2)

### **Common RISC-V Opcodes**

|Instruction|Opcode|funct3|funct7|
|---|---|---|---|
|**R-type**|0110011|(var)|(var)|
|**I-type Arithmetic**|0010011|(var)|N/A|
|**I-type Load**|0000011|(var)|N/A|
|**S-type Store**|0100011|(var)|N/A|
|**B-type Branch**|1100011|(var)|N/A|
|**U-type**|0110111 (lui) / 0010111 (auipc)|N/A|N/A|
|**J-type**|1101111 (jal) / 1100111 (jalr)|N/A|N/A|

### **funct3 Meanings by Instruction Type**

|funct3|R/I Arithmetic|Load|Store|Branch|
|---|---|---|---|---|
|**000**|ADD/SUB|LB|SB|BEQ|
|**001**|SLL|LH|SH|BNE|
|**010**|SLT|LW|-|-|
|**011**|SLTU|-|-|-|
|**100**|XOR|LBU|-|-|
|**101**|SRL/SRA|LHU|-|-|
|**110**|OR|-|-|-|
|**111**|AND|-|-|-|

---

## **PART 6: SINGLE-CYCLE DATAPATH DESIGN**

### **Critical Path (Longest Delay)**

The clock cycle time must accommodate the **longest possible operation**:

```
T_cycle = max(T_CLK-to-Q + T_InstMem + T_RegFile(read) + T_ALU 
          + T_DataMem(read) + T_RegFile(setup) + T_skew)
```

**This is why LOAD instructions dominate single-cycle design:**

1. Fetch instruction (InstMem access)
2. Read registers from RegisterFile
3. Calculate address (ALU)
4. **Access Data Memory (slow!)**
5. Write back to register
6. Setup time for next cycle

### **Single-Cycle vs. Pipelined Trade-offs**

|Aspect|Single-Cycle|Pipelined|
|---|---|---|
|**CPI**|1|~1 (ideal)|
|**Clock Period**|Long|Short|
|**Throughput**|Low|High|
|**Control Complexity**|Simple|Complex (hazard detection)|
|**Implementation**|Easier|Harder|

### **Key Design Principles for Single-Cycle RISC-V**

1. **Fixed Instruction Width**: 32 bits → simpler decode
2. **Regular Format**: rs1 & rs2 always in same positions → parallel register read
3. **Immediate Encoding**: Consistent 12/20-bit widths → simpler immediate generation
4. **Register File Operations**: Only operations on registers/immediates → no memory-to-memory ops

### **Example: SW (Store Word) Execution**

From your lecture slide:

```
Instruction: SW X2, offset(X1)
Encoding:    [imm[11:5]] [X2] [X1] [010] [imm[4:0]] [0100011]

Control Signals:
- RegWr = 0          (don't write register)
- MemWr = 1          (enable memory write)
- MemRd = 0          (no memory read)
- ALUSrc = 1         (use immediate for offset)
- Bsel = 1           (immediate as input B)
- WBsel = X          (don't care, no write-back)

Datapath:
1. Read rs1 (X1) and rs2 (X2) from registers
2. ALU: rs1 + imm (address calculation)
3. Write rs2 value to memory at calculated address
```

### **Example: BEQ (Branch If Equal) Execution**

From your lecture slide:

```
Instruction: BEQ X1, X2, label
Encoding:    [imm[12|10:5]] [X2] [X1] [000] [imm[4:1|11]] [1100011]

Control Signals:
- RegWr = 0          (don't write register)
- MemRd = 0          (no memory access)
- MemWr = 0          (no memory write)
- ALUSrc = 0         (use rs2)
- Asel = 0           (use rs1)
- PCSrc = (BrEq) ? 1 : 0
- ALUOp = 01         (SUB for comparison)

Datapath:
1. ALU: rs1 - rs2
2. Compare: Set BrEq if result == 0
3. If BrEq = 1: PC ← PC + (imm << 1)
   If BrEq = 0: PC ← PC + 4
```

---

## **PART 7: PIPELINED DATAPATH **

### **Five-Stage Pipeline Stages**

```
Stage 1: IF  - Fetch instruction from memory
         ↓ (latch: PC, Instruction)
Stage 2: ID  - Decode, read registers, generate immediates
         ↓ (latch: RegData1, RegData2, Immediate, Control signals)
Stage 3: EX  - Execute ALU operation
         ↓ (latch: ALUResult, RegData2, WriteReg, Control)
Stage 4: MEM - Access data memory (load/store)
         ↓ (latch: MemData, ALUResult, WriteReg, Control)
Stage 5: WB  - Write result to register
```

### **Hazard Detection & Resolution**

**Data Hazards** (instruction depends on previous result):

```
Example: add x1, x2, x3    // Stage 3 (EX): ALU calculates
         add x4, x1, x5    // Stage 2 (ID): tries to read x1 too early

Solution: Forwarding (bypass ALU result directly to next instruction)
```

**Control Hazards** (branch/jump affects PC):

```
Example: beq x1, x2, label // Stage 3 (EX): determines branch target
         add x5, x6, x7    // Stage 1 (IF): fetches wrong instruction

Solution: Branch prediction or delay slot
```

**Structural Hazards** (resource contention):

```
Example: Same register file port needed for read and write simultaneously

Solution: Dual-port register file or staggered reads/writes
```

---

## **PART 8: DEBUGGING & VERIFICATION TIPS**

### **Common Assembly Programming Mistakes**

|Error|Cause|Fix|
|---|---|---|
|**Register overwrite**|Using callee-saved reg without saving|Save x8-x27 to stack|
|**Stack misalignment**|SP not aligned to 16 bytes|Adjust sp before function call|
|**Return address lost**|Overwriting x1 (ra)|Save ra if calling nested functions|
|**Argument not passed**|Forgot to load into a0-a7|Check calling convention|
|**Wrong register width**|Using 32-bit instruction for 64-bit|Use proper XLEN|

### **Single-Cycle Simulation Checklist**

```
□ Verify all control signals for instruction type
□ Check ALU input multiplexers (Asel, Bsel)
□ Verify register file read/write enable
□ Check memory read/write signals match instruction
□ Trace data from IF → ID → EX → MEM → WB
□ Verify branch target calculation (PC + imm_SE)
□ Check immediate sign extension for each format
□ Verify funct3/funct7 ALU control decoding
```

---

## **QUICK REFERENCE: CONTROL SIGNAL TABLE**

**Fill in for each instruction type:**

|Instruction|PCSrc|RegWr|MemRd|MemWr|ALUSrc|WBsel|ALUOp|
|---|---|---|---|---|---|---|---|
|R-type (add/sub/and/or/etc)|0|1|0|0|0|1|10|
|I-type Arithmetic (addi/xori)|0|1|0|0|1|1|10|
|Load (lw/lh/lb)|0|1|1|0|1|0|00|
|Store (sw/sh/sb)|0|0|0|1|1|X|00|
|Branch (beq/bne/blt)|Branch|0|0|0|0|X|01|
|JAL|1|1|0|0|1|2|00|
|JALR|1|1|0|0|1|2|00|

---
## **EXAM STRATEGY TIPS**
1. **For control signal questions**: Start with instruction type (R/I/S/B/U/J), then fill control signals
2. **For datapath tracing**: Follow the data flow: InstMem → RegFile → ALU → DataMem → RegFile
3. **For pipeline hazards**: Identify which stage produces result, which stage needs result
4. **For ALU control**: Determine opcode → ALUOp, then use funct3/funct7
5. **Time management**: Control signal problems (5 min) → Datapath trace (8 min) → Pipeline (10 min)