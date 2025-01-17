import { NextApiRequest, NextApiResponse } from 'next';

import { updateBalance } from '@/lib/balance';
import prisma from '@/lib/prisma';
import { serializeUser } from '@/lib/serializeUser';
import withMiddleware from '@/utils/withMiddleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: String(id) },
        select: { tokenBalance: true },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.status(200).json({ tokenBalance: user.tokenBalance });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'PATCH') {
    const { amount, reason } = req.body;
    const updateReason = reason || 'Gift From Female Community';

    try {
      const user = await updateBalance(String(id), amount, updateReason);
      res.status(200).json(serializeUser(user));
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};

export default withMiddleware(handler);
