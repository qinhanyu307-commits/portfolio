# Lu Kehao — Portfolio

Designer portfolio with an animated intro, About, project catalog, four featured projects, recognition list and contact footer.

## Live website

https://qinhanyu307-commits.github.io/portfolio/

## Local preview

Requires Node.js 20 or newer. No package installation is needed.

```sh
npm run build
npm run check
npm run dev
```

Open http://127.0.0.1:4175/portfolio/.

## Editing

`site/` contains the editable HTML, styles, interaction scripts, browser bundles and assets. `scripts/build.mjs` exports the GitHub Pages version into `docs/`, adjusts the `/portfolio/` base path and uses direct static images. Generated files are included so branch-based Pages can also publish `/docs`.

The GitHub Actions workflow builds, checks and deploys every push to `main`. For the first deployment, choose **Settings → Pages → Source → GitHub Actions** in this repository, then run the workflow if needed.

## Contact and reference links

The contact form opens an email draft addressed to `1810438404@qq.com`. It does not silently send mail or submit data to the reference agency. Featured-project, Careers and Privacy Policy links currently open the corresponding reference-site pages. The source layout and reference project material come from https://www.hellohello.is/ and are retained as requested for this portfolio preview.