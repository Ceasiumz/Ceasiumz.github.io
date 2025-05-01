# 每日CSharp: 基类调用

今天周小日在涉及卡牌游戏的架构时, 在 `MoveCardsAction` 的构造函数中, 使用了基类调用：

```csharp
public MoveCardsAction()
    : base("Move cards") { }
```

基类:
```cs
public GameAction(string name)
        {
            this.name = name;
        }
```
## 语法与作用
1. **语法**:
	- 在子类中使用关键字"base",  即可获得父类的引用.
	
2. **初始化基类的成员**：
   - `MoveCardsAction` 继承自 `GameAction`, 而 `GameAction` 的构造函数需要一个字符串参数（动作名称）.
   - 通过 `: base("Move cards")`, 子类调用了基类的构造函数, 并传递了 `"Move cards"` 作为参数.

2. **代码复用**：
   - 基类的构造函数可能包含一些通用的初始化逻辑, 例如设置默认值/分配资源等.
   - 子类通过调用基类构造函数, 可以避免重复实现这些逻辑.


---

## 游戏编程中的实例

#### **例子 1：动作系统**
在游戏中, 动作系统通常使用基类来定义通用的行为.例如：

```csharp
public class GameAction
{
    public string ActionName { get; private set; }

    public GameAction(string actionName)
    {
        ActionName = actionName;
    }

    public virtual void Execute()
    {
        Debug.Log($"Executing action: {ActionName}");
    }
}

public class MoveCardsAction : GameAction
{
    public MoveCardsAction() : base("Move cards") { }

    public override void Execute()
    {
        base.Execute(); // 调用基类的 Execute 方法
        Debug.Log("Moving cards...");
    }
}
```

**解释**：
- `GameAction` 是一个通用的动作基类, 定义了动作名称和执行逻辑.
- `MoveCardsAction` 继承自 `GameAction`, 通过基类调用设置动作名称, 并扩展了执行逻辑.

---

#### **例子 2：UI 系统**
在游戏中, UI 元素通常有一个通用的基类, 例如按钮/面板等.

```csharp
public class UIElement
{
    public string ElementName { get; private set; }

    public UIElement(string elementName)
    {
        ElementName = elementName;
    }

    public virtual void Show()
    {
        Debug.Log($"Showing UI element: {ElementName}");
    }
}

public class UIButton : UIElement
{
    public UIButton() : base("Button") { }

    public override void Show()
    {
        base.Show(); // 调用基类的 Show 方法
        Debug.Log("Displaying button-specific animations...");
    }
}
```

**解释**：
- `UIElement` 是一个通用的 UI 元素基类, 定义了名称和显示逻辑.
- `UIButton` 继承自 `UIElement`, 通过基类调用设置名称, 并扩展了显示逻辑.

---

#### **例子 3：角色系统**
在角色系统中, 基类可以定义通用的角色属性和行为, 例如生命值/攻击力等.

```csharp
public class Character
{
    public string Name { get; private set; }
    public int Health { get; private set; }

    public Character(string name,  int health)
    {
        Name = name;
        Health = health;
    }

    public virtual void Attack()
    {
        Debug.Log($"{Name} attacks!");
    }
}

public class Warrior : Character
{
    public Warrior() : base("Warrior",  100) { }

    public override void Attack()
    {
        base.Attack(); // 调用基类的 Attack 方法
        Debug.Log("Warrior performs a powerful strike!");
    }
}
```

**解释**：
- `Character` 是一个通用的角色基类, 定义了名称/生命值和攻击行为.
- `Warrior` 继承自 `Character`, 通过基类调用设置默认属性, 并扩展了攻击行为.

---

## 总结
基类调用在游戏编程中非常重要, 用于：
1. **复用基类的通用逻辑**.
2. **为子类提供统一的初始化方式**.
3. **在子类中扩展基类的功能**.

Ceasium 2025-3-22

---