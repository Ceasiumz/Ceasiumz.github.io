# I. Logic
## I.1. Propositional logic
### I.1.a.  Operators
#### Basic Operators
2. ¬ -> NOT
3. ∧ -> AND (analogue: ∩ -> intersection)
4. ∨ -> OR (analogue: ∪ -> union)

#### Augmented Operators
1. ⊕ -> Exclusive-OR i.e. XOR: OR without (T, T) 
	P⊕Q = (P∧¬Q)∨(¬P∧Q)
2. 


####  Truth Table
	Give all start states of conditions, derive all results of expression to be revealed.
1. e.g.

| P   | Q   | P∨Q |
| --- | --- | --- |
| T   | T   | T   |
| T   | F   | T   |
| F   | T   | T   |
| F   | F   | F   |
2. Table Construction
	1. Derive sub-formulas for each "true" rows (false rows)
		1. build subs with variants of AND(T, T, T) = T or OR(F, F, F) = F
	2. Use OR to connect each sub-formula(AND to connect)

## 1.2. 1st order logic
## Quantifiers
1. Universal quantifier
∀(read as "for all")
2. Existential quantifier
∃(read as "there exists" )
3. negated trans
	¬∀x : P(x)≡∃x : ¬P(x)
# II. Proof
## 1. Basic
## 2. Induction
## 3. Recursion

# III. Number Theory 