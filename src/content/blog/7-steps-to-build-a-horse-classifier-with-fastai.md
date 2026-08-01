---
title: "7 steps to build a Horse Classifier with FastAI"
description: 'The FastAI Course is "A free course designed for people with some coding experience, who want to learn how to apply deep learning and machine learning to pra...'
publishedAt: "2025-05-28T13:31Z"
draft: false
legacyBearUrl: "https://thisisprince.bearblog.dev/7-steps-to-build-a-horse-classifier-with-fastai/"
---

The [FastAI Course](https://course.fast.ai/) is _"A free course designed for people with some coding experience, who want to learn how to apply deep learning and machine learning to practical problems."_

This blog post is a quick summary on how to build an image classification model for horses using part 1, lesson 1 of the course which you can find [here](https://course.fast.ai/Lessons/lesson1.html). I recommend watching the video and also reading the chapter 1 of the [book](https://github.com/fastai/fastbook/blob/master/01_intro.ipynb).

We're going to be using Python in Jupyter Notebooks. You can use them with free GPU access in Kaggle or similar platforms. I've found Kaggle to be the easiest to set up but you may prefer Google Collab, for example.

## Step 1: Install libraries/dependencies

```python
from duckduckgo_search import DDGS
from fastcore.all import *
from fastdownload import *
from fastai.vision.all import *
from fastai.data.external import *
```

DDGS will allow us to gather images by searching for them in DuckDuckGo. The other 'fast' modules allow us to download images and train our classification model using the images. These fast modules are just wrappers of pytorch designed to make it much easier and quicker to set up models (while losing customisability and other options).

## Step 2: Gather data

```python
def search_images(keywords, max_images=200):
    return L(DDGS().images(keywords, max_results=max_images)).itemgot('image')

searches = 'horse', 'donkey'
path = Path('horse_or_donkey')

for s in searches:
    dest = (path/s)
    dest.mkdir(exist_ok=True, parents=True)
    download_images(dest, urls=search_images(f'{s} photo'))
    resize_images(path/s, max_size=400, dest=path/s)
```

We define a function "search\_images" which basically wraps a DDGS function allowing us to download images. "L" is a class provided by FastAI which allows us to interact with the images in a more useful way.

The rest of the code downloads images of horses and donkey into folders with the same name. These folders are themselves inside a folder named "horse\_or\_donkey".

## Step 3: Delete corrupt data

Some images may be corrupted or not usable.

```python
failed = verify_images(get_image_files(path))
failed.map(Path.unlink)
len(failed)
```

This code will delete these images so they aren't used in training.

## Step 5: Prepare the data

```python
dls = DataBlock(
    blocks=(ImageBlock, CategoryBlock),
    get_items=get_image_files,
    splitter=RandomSplitter(valid_pct=0.2, seed=42),
    get_y=parent_label,
    item_tfms=[Resize(192, method='squish')]
).dataloaders(path)
```

Dataloaders is an object which loads data for training. It contains the training set and validation set. We create it using DataBlock. This code allows us to: define what type of data we are dealing with; label the data; split the data into training and validation sets; and do some data augmentation.

## Step 6: Train Model

```python
learn = vision_learner(dls, resnet18, metrics=error_rate)
learn.fine_tune(3)
```

This code tells FastAI to use the data in dls with the resnet18 image classification model. We also tell it to optimise for error\_rate and use 3 epochs of training.

## Step 7: Test

```python
is_donkey,_,probs = learn.predict(PILImage.create('donkey.jpg'))
print({is_donkey})
print(_)
print(probs[0])
```

This blog post was based heavily on [this](https://github.com/fastai/course22/blob/master/00-is-it-a-bird-creating-a-model-from-your-own-data.ipynb).
