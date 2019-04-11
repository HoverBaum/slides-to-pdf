# Slides to PDF

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

This utility exports HTML based slides as a single PDF file.

## Install and use

❗️Requires Java 6 or higher to be installed❗️

The Java requirement comes from our dependency on [easy-merge-pdf](https://www.npmjs.com/package/easy-pdf-merge), we are open to alternatives.

```bash
npm i -g @hoverbaum/slides-to-pdf
```

To use the tool make sure your presentation is running at a reachable url and provide it as `baseUrl`.

```bash
slides-to-pdf <baseUrl>
```

We assume that your slides will be reachable under `baseUrl/SlideNumber`.
