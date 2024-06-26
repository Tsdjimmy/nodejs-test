const httpStatus = require('http-status');
const { getProfileById } = require("../helper/getProfile.helper");
const { sendServerErrorResponse, sendErrorResponse } = require('../helper/apiResponse.helper');

class ProfileMiddleware {
  async getProfile(req, res, next) {
    try {
      const profileId = req.get('profile_id');
      if (!profileId) {
        return sendErrorResponse(res, httpStatus.BAD_REQUEST, 'Profile ID is missing');
      }

      const profile = await getProfileById(profileId);
      if (!profile) {
        return sendErrorResponse(res, httpStatus.UNAUTHORIZED, 'Unauthorized Profile');
      }

      req.profile = profile;
      next();
    } catch (error) {
      return sendServerErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, { message: 'Internal server error' });
    }
  }
}

module.exports = new ProfileMiddleware();
