'use strict';

require.context("../img/", true);

require('../vendor/theme/classic/global/src/scss/bootstrap.scss');
require('../vendor/theme/classic/global/src/scss/bootstrap-extend.scss');

require('../vendor/theme/classic/base/src/scss/site.scss');

// add icons
require('../vendor/theme/classic/global/src/fonts/web-icons/web-icons.scss');
require('../vendor/theme/classic/global/src/fonts/brand-icons/brand-icons.scss');

require('../scss/general.scss');