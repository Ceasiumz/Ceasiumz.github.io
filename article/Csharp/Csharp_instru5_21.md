# 每日CSharp: inline method——游戏编程中的性能利刃

周小日正在转型技术美术,  逐渐意识到inline 方法在游戏开发中的重要作用. 本文将解析`inline method`（inline 方法）与`in/out/ref`三个关键字的组合应用, 结合Unity引擎帮助你理解运用. 


---

## 一、Learning: inline 方法的原理
### 1.1 赫赫, 芝士 inline 的本质
通过`[MethodImpl(MethodImplOptions.AggressiveInlining)]`特性强制inline , 可将高频调用的简单方法直接嵌入调用位置. 例如在Unity的`Update()`循环中处理10, 000个敌人的移动计算时, inline 可消除方法调用栈开销. 

```csharp
[MethodImpl(MethodImplOptions.AggressiveInlining)]
private float CalculateMoveSpeed(Enemy enemy) {
    return enemy.BaseSpeed * (1 + GameManager.Difficulty * 0.2f);
}
```

### 1.2 游戏开发实例
- **物理引擎计算**：刚体碰撞检测中的向量运算
- **动画状态机**：骨骼插值计算的快速实现
- **UI渲染批次**：界面元素位置/透明度实时更新
- **粒子系统**：生命周期与运动轨迹的逐帧计算


---

## 二、Learning: 更便捷的语义--参数修饰符：in/out/ref
### 2.1 受控引用 vs 内存操作
`in/out/ref` 作为参数修饰关键字,  旨在引导开发者对传参进行权限控制. 若与C放在一起比较, 不难发现其指针传递的本质.

| 修饰符   | 数据流向 | 初始化要求 | 游戏开发典型场景            |
| ----- | ---- | ----- | ------------------- |
| `in`  | 单向输入 | 必须    | 物理碰撞检测的只读参数[^6][^7] |
| `out` | 单向输出 | 无需    | 射线检测返回命中信息[^8]      |
| `ref` | 双向修改 | 必须    | 玩家状态实时修改[^6][^8]    |
- **具体使用场景**
	- `in`: 只读模式
		- C#的`in`参数类似C的`const`指针, 保证数据只读：
```csharp
    void Read(in BigData data);  // C#, 禁止修改data
```

```c
    void read(const BigData* data); // C, 通过const限制    
```
- 
	- `out`: 自我修改相关方法 / 多返回值
		- 内存级的"集体变换"
```csharp
    void GetMinMax(int[] arr,  out int min,  out int max);
```

```c
    void get_min_max(int* arr,  int* min,  int* max);
```
- 
	- `ref`: 传递大型结构体避免拷贝
		- 简单的自增示例:
```csharp
// C# ref
void Modify(ref int x) => x++;
```

```c
// C指针
void modify(int* x) { (*x)++; }
```

### 2.2 游戏开发实例
#### 案例1：物理碰撞检测（in+out）
- 未inline
```csharp
// 未优化的实现方式
public RaycastHit Raycast(Vector3 origin,  Vector3 direction) {
    // balabala复杂计算逻辑
    return RaycastHit hitInfo;
}
```
- inline 实现
```csharp
public bool Raycast(in Vector3 origin,  in Vector3 direction,  out RaycastHit hitInfo) {
	bool xxflag; //declare 一个flag追踪方法执行情况
    // 使用in避免120字节的Vector3结构体复制
    // 通过out返回法线、碰撞点等复合数据
    hitInfo = _hitInfo;// reassign 使 out 具有意义
    return xxflag // 这个必须return
}
```
**性能瓶颈分析** : 

1. ​**细节防查重** : 
    试想: `Vector3`结构体包含3个`float`字段 (共12字节)   ,  但实际传递时可能因内存对齐占用16字节 . 每次调用会产生**两次完整拷贝**​ (参数传递+返回值)  

2. ​**垃圾分类啊嗯** :
    若`RaycastHit`结构体包含引用类型字段 ,  `out`参数可能导致堆内存分配 (尽管结构体本身是值类型)   . 
    
#### 案例2：玩家状态机（ref）
```cs
public void ApplyDamage(Player player,  int damage){
// 相当于每次使用方法都要复制一个新的player
}
```

```csharp
public void ApplyDamage(ref Player player,  int damage) {
    player.CurrentHP = Mathf.Max(0,  player.CurrentHP - damage);
    player.IsInvincible = true;  // 直接修改内存中的玩家对象
}
```

#### 案例3：AI决策系统（in）
```csharp
public AIAction DecideAction(in GameEnvironment env) {
    // 读取但不修改环境光照、NPC位置等全局状态
    // GameEnvironment很敏感,  不要随便写入哦(*/ω＼*)
}
```

---

## 三、练习: 复合优化策略
### 3.1 尝试堆砌亿下
```csharp
public struct CollisionData {
    public Vector3 Point;
    public float Impulse;
}

[MethodImpl(MethodImplOptions.AggressiveInlining)]
public static void ResolveCollision(ref Rigidbody body,  in CollisionData data) {
    // inline 方法+ref修改刚体状态+in只读碰撞数据
}
```

### 3.2 性能对比测试
在Unity 2023 LTS环境下对10, 000个NPC进行寻路计算：

| 优化方式       | 耗时(ms) | GC内存分配(MB) |     |
| ---------- | ------ | ---------- | --- |
| 普通方法       | 48.2   | 12.4       |     |
| inline +in | 31.7   | 0.8        |     |
| 全优化        | 22.4   | 0.2        |     |
== 数据来源: 忠诚的ChatGPT

---

## 四、最后: 写给宝宝的注意事项
1. **inline 禁区**：避免对包含`try-catch`或超过20行代码的方法inline 
2. **结构体尺寸**：`in`参数传递的结构体建议小于64字节
3. **多线程同步**：`ref`修改需配合`lock`或`Interlocked`类

---
# 作业
2.2 案例1代码中的 `Raycast`方法 应该怎么调用呐?

bool flag = (origin,  direction,  hitInfo)