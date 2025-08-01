import { SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { getSqlFromFile, queryDuneSql } from "../../helpers/dune";
import { FetchOptions } from "../../adapters/types";

interface IData {
    quote_mint: string;
    total_volume: number;
    total_trading_fees: number;
    total_protocol_fees: number;
    total_referral_fees: number;
}

const fetch = async (_a: any, _b: any, options: FetchOptions) => {
    const query = getSqlFromFile('helpers/queries/dbc.sql', {
        tx_signer: '5qWya6UjwWnGVhdSBL3hyZ7B45jbk6Byt1hwd7ohEGXE',
        start: options.startTimestamp,
        end: options.endTimestamp
    })

    const data: IData[] = await queryDuneSql(options, query)

    const dailyFees = options.createBalances();
    const dailyProtocolRevenue = options.createBalances();

    data.forEach(row => {
        const totalFees = Number(row.total_protocol_fees) + Number(row.total_referral_fees) + Number(row.total_trading_fees);
        dailyFees.add(row.quote_mint, Number(totalFees));
        dailyProtocolRevenue.add(row.quote_mint, Number(row.total_trading_fees));
    });

    return {
        dailyFees,
        dailyUserFees: dailyFees,
        dailyRevenue: dailyProtocolRevenue,
        dailyProtocolRevenue,
    };
};


const adapter: SimpleAdapter = {
    version: 1,
    adapter: {
        [CHAIN.SOLANA]: {
            fetch,
            start: '2025-04-27',
            meta: {
                methodology: {
                    Fees: "Trading fees paid by users.",
                    Revenue: "Fees collected by Believe protocol.",
                    ProtocolRevenue: "Fees collected by Believe protocol."
                }
            }
        }
    },
    isExpensiveAdapter: true
}

export default adapter
