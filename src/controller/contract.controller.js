const httpStatus = require('http-status');
const {
  fetchContractsById,
  fetchActiveContracts,
} = require("../service/contract.service");
const { sendSuccessResponse, sendServerErrorResponse } = require('../helper/apiResponse.helper');

class ContractController {
  async getContractsByID(req, res) {
    try {
      const queryParam = {
        profile_id: req.get("profile_id"),
        contract_id: req.params.id,
      };
      const getContract = await fetchContractsById(queryParam);
      return sendSuccessResponse(res, httpStatus.OK, getContract);
    } catch (error) {
      return sendServerErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async getContracts(req, res) {
    try {
      const queryParam = {
        profile_id: req.get("profile_id"),
      };
      const getAllContract = await fetchActiveContracts(queryParam);
      return sendSuccessResponse(res, httpStatus.OK, getAllContract);
    } catch (error) {
      return sendServerErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }
}

module.exports = new ContractController();
