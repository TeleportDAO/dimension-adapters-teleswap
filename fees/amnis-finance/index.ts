import type { Adapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { httpGet } from "../../utils/fetchURL";
//API
const config_rule = {
    headers: {
        'user-agent': 'axios/1.6.7'
    },
    withCredentials: true
}

const api_url = "https://api.amnis.finance/api/v1/tool/financials-snapshot";

interface IFeeData {
    value: number;
    timestamp: number;
}

const fetch = async (timestamp: number) => {
    // Amnis Finance started charging fees on 2024-10-03
    const amnisFeeStartDate = 1727888400;

    const dayEndpoint = `${api_url}?timestamp=${timestamp}&type=FEE_DAILY`;
    const dayFeesData = await httpGet(dayEndpoint, config_rule)
    const dailyFees = dayFeesData.filter((a: IFeeData) => a.timestamp >= amnisFeeStartDate).reduce((partialSum: number, a: IFeeData) => partialSum + a.value, 0); 
  
    const dailyUserFees = timestamp >= amnisFeeStartDate ? dailyFees * 0.07 : 0;
    const dailySupplySideRevenue = dailyFees - dailyUserFees;

    return {
        dailyUserFees: dailyUserFees,
        dailyFees: dailyFees,
        dailyRevenue: dailyUserFees,
        dailyProtocolRevenue: dailyUserFees,
        dailySupplySideRevenue: dailySupplySideRevenue,
        dailyHoldersRevenue: 0,
      };
}

const adapter: Adapter = {
    adapter: {
        [CHAIN.APTOS]: {
            fetch,
            start: '2023-10-18',
            meta: {
                methodology: {
                    UserFees: "Amnis Finance takes 7% fee on users staking rewards",
                    Fees: "Staking rewards earned by all staked APT",
                    Revenue: "Staking rewards",
                    ProtocolRevenue: "Amnis Finance applies a 7% fee on staking rewards to the DAO Treasury",
                    HoldersRevenue: "Noo fees for token holders",
                    SupplySideRevenue: "Staking rewards earned by stAPT holders",
                }
            }
        },
    }
  }
  
  export default adapter;
