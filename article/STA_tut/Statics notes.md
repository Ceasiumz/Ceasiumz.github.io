a# STA
## 1.4 Conditional Probability and Independence
### 1.4.1 law of total Probability
$$
\begin{align}
P(B) &= P(A_1)P(B|A_1)+P(A_2)P(B|A_2)+...+P(A_k)P(B|A_k)\\
&=\sum^{k}_{i=1}P(A_i)P(B|A_i)\\
\end{align}
$$
### 1.4.2 Bayes Theorem
$$P(A_j|B) = \frac{P(A_j)P(B|A_j)}{\sum^{k}_{i=1}P(A_i)P(B|A_i)} $$
### 1.4.3 Independence
- Pairwise independent: Two events \(A\) and \(B\) are pairwise independent if $P(A \cap B) = P(A)P(B)$.

- Mutually independent: A set of events $({A_1, A_2, \ldots, A_n})$ are mutually independent if for every subset of these events, the probability of their intersection is equal to the product of their individual probabilities. Formally, for any subset $({A_{i_1}, A_{i_2}, \ldots, A_{i_k}})$,
$$
P(A_{i_1} \cap A_{i_2} \cap \ldots \cap A_{i_k}) = P(A_{i_1})P(A_{i_2}) \ldots P(A_{i_k})
$$
## 1.5 distribution
### Counting
- ordered sampling without replacement
	- $\frac{n!}{(n-k)!}$
- ordered sampling with replacement
  - $n^k$
- unordered sampling without replacement 
  - $\binom{n}{k} = \frac{n!}{k!(n-k)!}$
- unordered sampling n times within k kinds with replacement 
  - $\binom{n+k-1}{k} = \frac{(n+k-1)!}{k!(n-1)!}$
### <mark style="background: #CACFD9A6;">Discrete distribution</mark>
#### Bernoulli distribution
$$f(x)=p,~~\mu =p,~~\sigma^2 = p(1-p)$$
- Moment Generating Function (MGF):
$$M_X(t) = 1 - p + pe^t$$

#### Binomial distribution
n times processions of Bernoulli distributions
 $$f(x)=\binom{n}{x}p^{x}(1 - p)^{n - x},x = 0,1,\cdots,n$$
 $$~~\mu =np,~~\sigma^2 =n p(1-p)$$
- Moment Generating Function (MGF):
$$M_X(t) = (1 - p + pe^t)^n$$

#### Geometric distribution
 times of Bernoulli distributions until *1st* success occurs 
 $$f(x)=p(1 - p)^{x - 1},x = 1,2,\cdots$$
 $$~~\mu =1/p,~~\sigma^2 =(1-p)/p^2$$
- Moment Generating Function (MGF):
$$M_X(t) = \frac{pe^t}{1 - (1 - p)e^t}, \quad \text{for } t < -\ln(1 - p)$$

#### Negative binomial distribution
 times of Bernoulli distributions until rth success occurs
$$f(x)=\binom{x - 1}{r - 1}p^{r}(1 - p)^{x - r},x = r,r + 1,\cdots$$
$$~~\mu =r/p,~~\sigma^2 =r(1-p)/p^2$$
- Moment Generating Function (MGF):
$$M_X(t) = \left(\frac{pe^t}{1 - (1 - p)e^t}\right)^r, \quad \text{for } t < -\ln(1 - p)$$

#### Poisson distribution
  - APP(approximated poison procession)
	$$\lambda h = \mu$$
    $$\lambda = \frac{\mu}{h}$$
    *given*:
    **λ** parameter of poison procession
    **μ** *mean* && *var* of the poison distribution
    [h] time interval
  - pdf of poison distribution
$$  P(X=k) = \frac{\lambda^k}{k!}e^{-\lambda},~~\mu =\lambda,~~\sigma^2 =\lambda$$
- Moment Generating Function (MGF):
$$M_X(t) = \exp(\lambda(e^t - 1))$$

#### Uniform distribution(discrete)
*given* a discrete RV X, P(X=k) exist equivalently in ${a, a+1, ..., b}$
$$
\text{Discrete uniform distribution:}\quad P(X=k)=\frac{1}{n},\\mu=\frac{a+b}{2},\\sigma^2=\frac{(b-a+1)^2-1}{12}
$$
- Moment Generating Function (MGF):
$$M_X(t) = \frac{e^{at} - e^{(b+1)t}}{(b - a + 1)(1 - e^t)}$$

### <mark style="background: #CACFD9A6;">Continuous distribution</mark>
#### Uniform distribution(continuous)

*given* a continuous RV X, P(X=x) exist equivalently in $[a, b]$
$$
\text{Continuous uniform distribution:}\quad f(x)=\frac{1}{b-a},\\mu=\frac{a+b}{2},\\sigma^2=\frac{(b-a)^2}{12}
$$
- Moment Generating Function (MGF):
$$M_X(t) = \frac{e^{bt} - e^{at}}{t(b - a)}$$

#### Normal distribution

- A continuous random variable X is said to follow a normal distribution if its probability density function (pdf) is given by:
$$
{\large f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp{(-1/2\frac{(x - \mu)^2}{\sigma^2})},~~ -\infty < x < \infty}
$$
where:
- $\mu$ is the mean
- $\sigma^2$ is the variance
The normal distribution is symmetric about the mean $( \mu )$ and its shape is determined by the standard deviation $( \sigma )$.
- Moment Generating Function (MGF):
$$M_X(t) = \exp\left(\mu t + \frac{\sigma^2 t^2}{2}\right)$$
- Normalize to N(0, 1)
	- $\large{x\prime = \frac{x-\mu}{\sigma}}$

#### Exponential distribution
*given*: A RV X has an exponential distribution if its pdf is $\theta$(scale)
$$\large{f(x)=\frac{1}{\theta}e^{-\frac{x}{\theta}},~~ x\geq0,~~\theta\gt0 }$$
$$\mu =\theta,~~\sigma^2=\theta^2$$
or $f(x)={\lambda}e^{-{\lambda}}$ (speed)
*e.g.* suppose the waiting time RV: *W*, until the *1st* occurrence for an APP(Poisson distribution) has an **Exponential distribution** $\theta = 1/\lambda$ 
==$\lambda$ : the average number of occurrences per unit time==
$$f(W =w)={\lambda}e^{-\lambda w},~~ x\geq0,~~\theta\gt0 $$
- Moment Generating Function (MGF):
$$M_X(t) = \frac{1}{1 - \theta t}, \quad \text{for } t < \frac{1}{\theta}\text{ (scale) }$$
$$M_X(t) = \frac{\lambda}{\lambda -  t}, \quad \text{for } t < {\lambda}\text{ (speed) }$$

#### Logistic distribution
A continuous random variable X is said to follow a logistic distribution if its probability density function (pdf) is given by:
$$
f(x) = \frac{e^{-(x-\mu)/s}}{s(1+e^{-(x-\mu)/s})^2},~~ -\infty < x < \infty
$$
where:
- $\mu$ is the scale parameter
- $s$ is the var parameter

Properties:
- Mean:  $\mu$
- Variance:  $\large{\sigma^2 = \frac{\pi^2 s^2}{3}}$

- Moment Generating Function (MGF):
$$M_X(t) = \exp(\mu t) \frac{\Gamma(1 - st)}{\Gamma(-st)}, \quad \text{for } |t| < \frac{1}{s}$$

#### Gamma distribution
A continuous random variable X is said to follow a gamma distribution if its probability density function (pdf) is given by:
$$
\large{f(x) = \frac{x^{k-1}e^{-x/\theta}}{\theta^k \Gamma(k)},~~ x > 0,~~ k, \theta > 0}
$$
$$\mu =k\theta,~~\sigma^2=k\theta^2$$
where:
- $k$ is the shape parameter
- $\theta$ is the scale parameter
- $\Gamma(k)$ is the *Gamma function*
[[Gamma function]]
e.g. suppose the waiting time RV: *W*, until the *kth* occurrence for an APP(Poisson distribution) has an **Gamma distribution** 
- Moment Generating Function (MGF):
$$M_X(t) = (1 - \theta t)^{-k}, \quad \text{for } t < \frac{1}{\theta}$$

#### Chi-square distribution
A continuous random variable Q is said to follow a **chi-square distribution** if it is the sum of the squares of *k independent standard [[#Normal distribution|normal]] random variables*($X_k$).
Its probability density function (pdf) is given by:
$$if:~ X_1,X_2,\ldots,X_{k}\sim N(0,1),~~Q = \sum_{i = 1}^{k}X_{i}^{2}\sim \chi^{2}(k)$$
$$
f(Q=x) = \frac{1}{2^{k/2} \Gamma(k/2)} x^{(k/2)-1} e^{-x/2},~~ x > 0
$$
where:
- \( k \) is the degrees of $shape^*$ (freedom)

Properties:
- Mean:  $\mu = k$
- Variance:  $\sigma^2 = 2k$
- ==(p)-value==:  $\alpha = 1- cdf(Q\leq Z_\alpha)$, which means the probability of" Q = $\chi^2 \geq Z_\alpha$ " is $\alpha$ 
	- we denote $Q = \chi^2 >Z_\alpha$ to $\chi^2_\alpha(r)$ where $Q\sim \chi^2(r)$ at p-value $\alpha$

*e.g.* *Gamma distribution* with $\theta = 2,~~k=k^*/2$  (k^* is the new k) is *Chi-square distribution*
- Moment Generating Function (MGF):
$$M_X(t) = (1 - 2t)^{-k/2}, \quad \text{for } t < \frac{1}{2}$$



## 2. Random Vector distribution
### <mark style="background: #CACFD9A6;">Vector Discrete Distribution</mark>
#### Independence
X and Y are independence if $f(x, y) = f_x(x)f_y(y)$
$$f(x, y) = f_x(x)f_y(y)$$
#### Uncorrelation
$$E(XY)=E(X)(Y)$$
#### Correlation 
- w.r.t Covariance
	$$COV(x, y)= E((X-\bar{X})(Y-\bar{Y}))=E(XY)-E(X)E(Y) $$
	- $COV \gt 0\implies$positive correlation
	- $COV \lt 0\implies$negative correlation
	- Independence$\implies$ COV = 0
	$\CAUTION$ Independence$\not\Longleftarrow$ COV = 0
- Correlation Coefficient
$$\rho(X, Y)=\frac{\operatorname{Cov}(X, Y)}{\sqrt{\operatorname{Var}(X)} \sqrt{\operatorname{Var}(Y)}}$$


### 2.1 Some trivial conclusion
- For bivariable distributions, we have:
	- Cov(X, Y) = E(XY) - E(X)E(Y)
	- $\rho = r = \dfrac{Cov(X, Y)}{\delta x\delta y}$ 
	- E(XY) = E(X * E(X|Y))
### 2.2 Typical distributions
#### Trinomial distribution
*given* $(X, Y)\sim Trinomial(n, p_x,p_y)$ 
$$f(x,y)=\frac{n!}{x!y!(n-x-y)!}p_x^xp_y^y(1-p_x-p_y)^{n-x-y},(x,y)\in \bar{S}$$
$$\bar{S}={\{(x, y)|x+y\le n, x\&y=0, 1, \cdots , n\}}$$

#### Vector-Normal distribution


### 1.6 Models
#### (100p)th percentile
pth percentile($\large{\pi_p}$): x = $\large{\pi_p}$, *where* cdf(x) = cdf(x < X) = p 
*e.g.* 50th percentile = 2nd quantile(Median) = x, *where* cdf(x) = 1/2

#### Central Limited Theorem(CLT)
No matter what the true distribution is, the distribution of the sample mean will be very close to the normal distribution, as long as the sample size is large Enough
$$\text{sample mean }\bar{X}=\frac{X_1+X_2+\cdot+X_n}{n}$$
$$\bar{X}\sim N(\mu, \frac{\sigma^2}{n})$$
*To normalized*, (convert to standard normal)$$\frac{\sqrt{n}(\bar{X}-\mu)}{\sigma}\sim N(0, 1)$$
We use standard normal distribution to get the [[#^CI|Confident Interval]]

### Properties of Linear Combination for Multi RVs
> [!PDF|255, 208, 0] [[Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library).pdf#page=192&annotation=4047R|Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library), p.191]]
> > Say X1 , X2 , . . . , Xn are independent random variables and Y = u1 (X1 ) u2 (X2 ) · · · un(Xn). If E[ui(Xi)], i = 1, 2, . . . , n, exist, then E(Y) = E[u1 (X1 ) u2 (X2 ) · · · un(Xn)] = E[u1 (X1 )]E[u2 (X2 )] · · · E[un(Xn)].

> [!PDF|255, 208, 0] [[Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library).pdf#page=193&annotation=4050R|Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library), p.192]]
> > If X1 , X2 , . . . , Xn are n independent random variables with respective means μ1 , μ2 , . . . , μn and variances σ 2 1 , σ 2 2 , . . . , σ 2 n , then the mean and the variance of Y = ∑n i=1 ai Xi, where a1 , a2 , . . . , an are real constants, are, respectively,

$$
\begin{equation*}
  \begin{aligned}
  N=\sum^{4}_{i=1}I_i
    &\implies \mathrm{Var}(N) = \sum_{i=1}^4 \mathrm{Var}(I_i) + 2 \sum_{1 \le i < j \le 4} \mathrm{Cov}(I_i, I_j)\\
    I_i\quad independent &\implies \mathrm{Cov}(I_i, I_j)=0\implies \mathrm{Var}(N) = \sum_{i=1}^4 \mathrm{Var}(I_i)
  \end{aligned}
\end{equation*}
$$

---
5.5
### Extention of Normal Distribution
> [!PDF|yellow] [[Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library).pdf#page=201&selection=263,0,402,1&color=yellow|Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library), p.200]]
> > Theorem 5.5-1 If X1 , X2 , . . . , Xn are n mutually independent normal variables with means μ1 , μ2 , . . . , μn and variances σ 2 1 , σ 2 2 , . . . , σ 2 n , respectively, then the linear function Y = n∑ i=1 ci Xi has the normal distribution N ( n∑ i=1 ciμi, n∑ i=1 c2 i σ 2 i ) .

### Square sum of Normal RVS follows Chi-square Dist.
> [!PDF|yellow] [[Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library).pdf#page=203&selection=84,0,219,3&color=yellow|Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library), p.202]]
> > Theorem 5.5-2 Let X1 , X2 , . . . , Xn be observations of a random sample of size n from the normal distribution N(μ, σ 2 ). Then the sample mean, X = 1 n n∑ i=1 Xi, and the sample variance, S2 = 1 n − 1 n∑ i=1 (Xi − X) 2 , are independent and (n − 1)S2 σ 2 = ∑n i=1 (Xi − X) 2 σ 2 is χ2 (n−1).
> 
> 

### t distribution
> [!PDF|yellow] [[Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library).pdf#page=205&selection=143,0,256,1&color=yellow|Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library), p.204]]
> > (Student’s t distribution) Let T = Z √U/r , where Z is a random variable that is N(0, 1), U is a random variable that is χ2 (r), and Z and U are independent. Then T has a t distribution with pdf f (t) = ((r + 1)/2) √πr (r/2) 1 (1 + t2/r) (r+1)/2 , −∞ < t < ∞.
> 

### Practical use of CLT
> [!PDF|yellow] [[Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library).pdf#page=209&selection=410,0,495,1&color=yellow|Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library), p.208]]
> > (Central Limit Theorem) If X is the mean of a random sample X1 , X2 , . . . , Xn of size n from a distribution with a finite mean μ and a finite positive variance σ 2 , then the distribution of W = X − μ σ/√n = ∑n i=1 Xi − nμ √n σ is N(0, 1) in the limit as n → ∞.
> 
> 

### Approximation for discrete distribution
> [!PDF|yellow] [[Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library).pdf#page=215&selection=509,2,557,1&color=yellow|Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library), p.214]]
> >  The central limit theorem states that the distribution of W = Y − np √np(1 − p) = X − p √p(1 − p)/n is N(0, 1) in the limit as n → ∞.


### Chebyshev's inequality
> [!PDF|yellow] [[Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library).pdf#page=222&selection=454,0,501,1&color=yellow|Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library), p.221]]
> > (Chebyshev’s Inequality) If the random variable X has a mean μ and variance σ 2 , then, for every k ≥ 1, P(|X − μ| ≥ kσ ) ≤ 1 k2 .


### Law of Large Numbers (LLN)
Chebyshev form:
> [!PDF|yellow] [[Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library).pdf#page=223&selection=289,0,322,1&color=yellow|Probability and Statistical Inference, 9th Global Edition (Robert V. Hogg, Elliot A. Tanis etc.) (Z-Library), p.222]]
> > If ε = kσ , then P(|X − μ| ≥ ε) ≤ σ 2 ε2 .


### Limiting mgf technique
w.s.t Some i.i.d RV $X_1, X_2, X_3, \cdots$ 
$$\{M_n(t)\}^\infty_{n=1} \text{ means the mgf of } Z_n=f_n(X_1, X_2, X_3, \cdots)\implies X_n \to X \iff Z_n \to Z$$
 
# DDA
## Interval Estimation
### Confidence Interval
From some given distribution, we analyse its RVs as normal RVs, and according to CLT:
- $P(a\le \frac{\sqrt{n}(\bar{X}-\mu)}{\sigma} \le b)=\Phi(a)-\Phi(b)=\Phi(a)+\Phi(-b)-1,~~a>b$
	*i.e.* $$P(X - \frac{a \sigma}{\sqrt{n}}\le \mu \le X - \frac{b \sigma}{\sqrt{n}}))=\Phi(a)+\Phi(-b)-1,~~a>b$$
	*then if* we call the external probability $\alpha$ or $\alpha = 1-P(X - \frac{a \sigma}{\sqrt{n}}\le \mu \le X - \frac{b \sigma}{\sqrt{n}}))$
	We denote $a$ as $Z_{\alpha/2}$ While $b$ as$-Z_{\alpha/2}$
	And the confident interval is $1- \alpha$
	- The $1-\alpha$ confidence interval for $\mu$: $\bar{X} - z_{\alpha/2} \frac{\sigma}{\sqrt{n}}, \bar{X} + z_{\alpha/2} \frac{\sigma}{\sqrt{n}}$
	![[Pasted image 20250310113353.png]]
sth ^CI


## Maximum Likelihood estimation
Given a sufficient sampled RV group *X*, and a certain statistic model *f(x)*a
$\Rightarrow$ Find the most matching parameters "statistics" *θ*

$\theta = \text{parameters} \in \Theta = \text{additional information},~~x_i = \text{different RVs},~~f() = \text{PDF or PMF}$
$$\mathcal{L}(\forall x_i|\theta) = {f}(\forall x_i|\theta) = \prod_{i=1}^nP(x_i|\theta)$$
- Determine $\theta$
	By differentiation, we get $\mathcal{L}^\prime(\forall x_i|\theta)$
	let $\mathcal{L}^\prime(\forall x_i|\theta)=0$, we obtain the maximum of likelihood *θ* 

and we often use the logarithmic form to simplify the calculation
$$l(\forall x_i|\theta)= log(\mathcal{L}(\forall x_i|\theta)) = \sum_{i=1}^n log(P(x_i|\theta))$$
- let $\mathcal{l}^\prime(\forall x_i|\theta)=0$, we also obtain the maximum of likelihood *θ* 

## Residual Analysis
### Linear RA
$$Y\sim N(\beta_1 X + \beta_0,~~\sigma^2)$$
- Derivation of Linear Regression Slope $\beta_1$ in Covariance Form
1. **Covariance Form** and **Expanded Form** Equivalence
	The slope $\beta_1$ has two equivalent expressions:
	$$
	\beta_1 = \frac{\text{Cov}(x, y)}{\text{Var}(x)} = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2} \quad \text{(Covariance form)}
	$$
	$$
	\beta_1 = \frac{n \sum x_i y_i - \sum x_i \sum y_i}{n \sum x_i^2 - (\sum x_i)^2} \quad \text{(Expanded form)}
	$$

2. Proof of **Equivalence**
	Expand the numerator and denominator of the covariance form:
	$$
	\begin{aligned}
	\sum (x_i - \bar{x})(y_i - \bar{y}) &= \sum x_i y_i - \bar{x} \sum y_i - \bar{y} \sum x_i + n \bar{x} \bar{y} \\
	&= \sum x_i y_i - n \bar{x} \bar{y}, \\
	\sum (x_i - \bar{x})^2 &= \sum x_i^2 - 2 \bar{x} \sum x_i + n \bar{x}^2 \\
	&= \sum x_i^2 - n \bar{x}^2.
	\end{aligned}
	$$
	Thus, the *covariance form* becomes:
	$$
	\beta_1 = \frac{\sum x_i y_i - n \bar{x} \bar{y}}{\sum x_i^2 - n \bar{x}^2}.
	$$
	The *expanded form* reduces to the same expression by substituting $\sum x_i = n \bar{x}$ and $\sum y_i = n \bar{y}$.

3. Key Conclusions
	- The numerator and denominator are aggregated sums and can $\NOT$ be split into per-term ratios.
	- The *slope* $\beta_1$ represents a global trend, not local relationships.
	- The *covariance form* and *expanded form* are inherently **equivalent**.
### Concave optimization