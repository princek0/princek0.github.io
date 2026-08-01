---
title: "Applying Stochastic Gradient Descent (SGD) to a single-feature linear regression problem"
description: "SGD is an optimisation algorithm that updates model parameters using the gradient of the loss function w.r.t. the parameters on a small and random subset of ..."
publishedAt: "2025-05-28T21:09Z"
draft: false
legacyBearUrl: "https://thisisprince.bearblog.dev/applying-stochastic-gradient-descent/"
---

SGD is an optimisation algorithm that updates model parameters using the gradient of the loss function w.r.t. the parameters on a small and random subset of data.

In this blog post, I'll explain how SGD works by applying it to a basic ML scenario. In the future I hope to apply it to more complex scenarios such as CNNs and reinforcement learning.

## 1\. Single-feature Linear Regression (Easy)

Our goal is to predict the price of a car based on its age. Our single feature is the age.

Let <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>x</mi><mo>=</mo></mrow></math>age of car and <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>y</mi><mo>=</mo></mrow></math>actual price.

We guess that there is a linear relationship between price and age, and hence:

<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><mover><mrow><mi>y</mi></mrow><mo stretchy="false">^</mo></mover><mo>=</mo><mi>w</mi><mi>x</mi><mo>+</mo><mi>b</mi></mrow></math>

where <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mover><mrow><mi>y</mi></mrow><mo stretchy="false">^</mo></mover></mrow></math> is the model's prediction of the price, <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>w</mi></mrow></math> is weight, and <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>b</mi></mrow></math> is bias.

We define our "loss" function to measure how wrong our model is with

<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><mi>L</mi><mo stretchy="false">(</mo><mi>w</mi><mo>,</mo><mi>b</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mrow><mn>1</mn></mrow><mrow><mn>2</mn></mrow></mfrac><mo stretchy="false">(</mo><mover><mrow><mi>y</mi></mrow><mo stretchy="false">^</mo></mover><mo>−</mo><mi>y</mi><msup><mo stretchy="false">)</mo><mrow><mn>2</mn></mrow></msup><mo>=</mo><mfrac><mrow><mn>1</mn></mrow><mrow><mn>2</mn></mrow></mfrac><mo stretchy="false">(</mo><mi>w</mi><mi>x</mi><mo>+</mo><mi>b</mi><mo>−</mo><mi>y</mi><msup><mo stretchy="false">)</mo><mrow><mn>2</mn></mrow></msup></mrow></math>

Our goal is to minimise this loss function.

### Step 1: Randomly initialise parameters.

Let's say <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>w</mi><mo>=</mo><mn>0.5</mn><mo>,</mo><mi>b</mi><mo>=</mo><mn>0</mn></mrow></math>.

### Step 2: Randomly pick one training example

It's important that it's random and a small part of the data (this is the 'stochastic' part).

Suppose <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>x</mi><mo>=</mo><mn>5</mn></mrow></math> and <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>y</mi><mo>=</mo><mn>10</mn><mo>,</mo><mn>000</mn></mrow></math>.

Our model would predict the price to be <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mn>2</mn><mo>,</mo><mn>500</mn></mrow></math> (check this using the formula before).

### Step 3: Compute the loss

The loss is 28.125

### Step 4: Compute the gradients

We need to calculate the derivative of the loss function L with respect to the parameters <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>w</mi></mrow></math> and <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>b</mi></mrow></math>. For <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>w</mi></mrow></math> you get the gradient is <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mo>−</mo><mn>37.5</mn></mrow></math>, and for <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>b</mi></mrow></math>, it is <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mo>−</mo><mn>7.5</mn></mrow></math>.

The gradient tells us the direction and magnitude we should change our parameters to reduce the loss.

If the gradient is positive, then the parameter is too high, and we need to reduce it.

If it is negative, then we need to increase it.

It might be helpful to think of the loss function as if it were <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><msup><mi>x</mi><mn>2</mn></msup></mrow></math> to help visualise why the gradient means what it means (since we want to get to the minima of the loss function).

### Step 5: Update the parameters

Let <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>p</mi></mrow></math> be a parameter we are trying to optimise and let <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>η</mi></mrow></math> be our learning rate.

Then <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><msub><mi>p</mi><mrow><mi>n</mi><mi>e</mi><mi>w</mi></mrow></msub><mo>=</mo><msub><mi>p</mi><mrow><mi>o</mi><mi>l</mi><mi>d</mi></mrow></msub><mo>−</mo><mi>η</mi><mi>·</mi><mfrac><mrow><mi>∂</mi><mi>L</mi></mrow><mrow><mi>∂</mi><mi>p</mi></mrow></mfrac></mrow></math>

Use that formula to update <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>w</mi></mrow></math> and <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mi>b</mi></mrow></math>.

### Step 6: Repeat

Repeat the above steps until the loss converges to a minimum.

This example of Stochastic Gradient Descent (SGD) was designed to help you understand the intuition behind the mathematics of deep learning. In the future, I'll make more posts on DL with fastai and PyTorch and explain key concepts like backpropagation.
