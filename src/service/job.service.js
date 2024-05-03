const { Op } = require("sequelize");
const { Job, Contract, Profile } = require("../model/index");

const unpaidJobs = async ({ profile_id }) => {
  try {
    return await Job.findAll({
      where: {
        [Op.or]: [{ paid: false }, { paid: null }],
      },
      include: [
        {
          model: Contract,
          required: true,
          where: {
            status: "in_progress",
            [Op.or]: [{ ClientId: profile_id }, { ContractorId: profile_id }],
          },
        },
      ],
    });    
  } catch (error) {
    const errorMessage = "Failed to fetch unpaid jobs.";
    throw new Error(`${errorMessage} ${error.message}`); 
  }
};

const payToJob = async ({ job_id, client_id, balance }) => {
  const jobDetail = await Job.findOne({
    where: {
      id: job_id,
    },
    include: [
      {
        model: Contract,
        required: true,
        where: {
          ClientId: client_id,
          status: "in_progress",
        },
      },
    ],
  });

  if (!jobDetail) {
    return { success: false, message: 'Job not found', data: null };
  }

  if (jobDetail.paid) {
    return { success: false, message: 'No due payments'};
  }

  const amountToBePaid = jobDetail.price;
  const contractorId = jobDetail.Contract.ContractorId;

  if (balance < amountToBePaid) {
    return { success: false, message: 'Insufficient funds', data: null };
  }

  const t = await sequelize.transaction();
  try {
    await Profile.update(
      { balance: sequelize.literal(`balance - ${amountToBePaid}`) },
      { where: { id: client_id, type: "client" }, transaction: t }
    );

    await Profile.update(
      { balance: sequelize.literal(`balance + ${amountToBePaid}`) },
      { where: { id: contractorId, type: "contractor" }, transaction: t }
    );

    await Job.update(
      { paid: 1, paymentDate: new Date() },
      { where: { id: job_id }, transaction: t }
    );

    await t.commit();
    return { success: true, message: `Transaction of ${amountToBePaid} has been made successfully.`, data: null };
  } catch (error) {
    console.error(error.message);
    await t.rollback();
    return { success: false, message: `Transaction of ${amountToBePaid} has failed, please try again`, data: null };
  }
};

module.exports = { unpaidJobs, payToJob };
