//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { bigintTransformer, bigintArrayTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockHash', 'contractAddress', '_sponsor'], { unique: true })
export class GetSponsoring {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar', { length: 42 })
    contractAddress!: string;

  @Column('numeric', { transformer: bigintTransformer })
    _sponsor!: bigint;

  @Column('numeric', { array: true, transformer: bigintArrayTransformer })
    value!: bigint[];

  @Column('text', { nullable: true })
    proof!: string;
}
